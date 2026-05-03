import { z } from "zod"
import { getHwJob } from "@/lib/jobs-api"
import { badRequest, runProxy } from "@/lib/jobs-api/proxy"

const paramsSchema = z.object({
  kjno: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[\w-]+$/, "kjno must contain only alphanumerics, underscore, or hyphen"),
})

export async function GET(
  _request: Request,
  context: { params: Promise<{ kjno: string }> },
) {
  const params = await context.params
  const parsed = paramsSchema.safeParse(params)
  if (!parsed.success) {
    return badRequest("INVALID_PARAMETER", "Invalid kjno", parsed.error.issues)
  }

  return runProxy(() => getHwJob(parsed.data.kjno), {
    cache: { sMaxAge: 600, swr: 1_200 },
  })
}
