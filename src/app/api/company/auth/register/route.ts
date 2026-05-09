import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hashSync } from "bcryptjs";
import { prisma } from "@/lib/db";
import { PREFECTURES } from "@/lib/constants";
import {
  sendCompanyRegistrationEmail,
  sendCompanyRegistrationAdminNotification,
} from "@/lib/email";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

const companyRegisterSchema = z.object({
  companyName: z.string().min(1, "会社名は必須です。"),
  industry: z.string().min(1, "業種は必須です。"),
  prefecture: z.enum(PREFECTURES, "有効な都道府県を選択してください。"),
  contactEmail: z.string().email("有効なメールアドレスを入力してください。"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください。"),
});

export async function POST(request: NextRequest) {
  // スパム登録対策のレート制限
  const rl = checkRateLimit({
    key: `company-register:${getClientIp(request)}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!rl.allowed) return rateLimitResponse(rl);

  try {
    const body = await request.json();
    const parsed = companyRegisterSchema.safeParse(body);

    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message ?? "入力内容に誤りがあります。";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { companyName, industry, prefecture, contactEmail, password } =
      parsed.data;

    const existingUser = await prisma.companyUser.findUnique({
      where: { email: contactEmail },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "このメールアドレスは既に登録されています。" },
        { status: 409 }
      );
    }

    const passwordHash = hashSync(password, 12);

    const company = await prisma.$transaction(async (tx) => {
      const created = await tx.company.create({
        data: {
          name: companyName,
          industry,
          prefecture,
          contactEmail,
          // 管理者の手動承認待ち
          status: "pending",
        },
      });

      await tx.companyUser.create({
        data: {
          companyId: created.id,
          email: contactEmail,
          passwordHash,
          name: companyName,
          role: "admin",
        },
      });

      return created;
    });

    // メール送信失敗で登録自体を失敗させたくないため try-catch で握る
    try {
      await Promise.all([
        sendCompanyRegistrationEmail(contactEmail, companyName),
        sendCompanyRegistrationAdminNotification({
          companyId: company.id,
          companyName,
          industry,
          prefecture,
          contactEmail,
        }),
      ]);
    } catch (emailError) {
      console.error("[company-register] email send failed:", emailError);
    }

    return NextResponse.json(
      { success: true, status: "pending" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Company registration error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました。" },
      { status: 500 }
    );
  }
}
