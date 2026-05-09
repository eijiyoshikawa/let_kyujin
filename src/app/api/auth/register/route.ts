import { NextResponse } from "next/server";
import { z } from "zod";
import { hashSync } from "bcryptjs";
import { prisma } from "@/lib/db";
import { PREFECTURES } from "@/lib/constants";
import { generateToken } from "@/lib/tokens";
import { sendEmailVerificationEmail } from "@/lib/email";

const registerSchema = z.object({
  name: z.string().min(1, "氏名は必須です。"),
  email: z.string().email("有効なメールアドレスを入力してください。"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください。"),
  prefecture: z.enum(PREFECTURES, "有効な都道府県を選択してください。"),
});

// メール確認トークンの有効期限: 24 時間
const VERIFICATION_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "入力内容に誤りがあります。";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { name, email, password, prefecture } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "このメールアドレスは既に登録されています。" },
        { status: 409 }
      );
    }

    const passwordHash = hashSync(password, 12);
    const verificationToken = generateToken();
    const verificationTokenExpiry = new Date(
      Date.now() + VERIFICATION_TOKEN_EXPIRY_MS
    );

    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        prefecture,
        verificationToken,
        verificationTokenExpiry,
      },
    });

    try {
      await sendEmailVerificationEmail(email, verificationToken);
    } catch (error) {
      console.error("[register] Failed to send verification email:", error);
      // メール送信失敗時もユーザー作成は完了させる（再送機能で復旧可能にする）
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "登録が完了しました。メールアドレスの確認用リンクを送信しましたのでご確認ください。",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました。" },
      { status: 500 }
    );
  }
}
