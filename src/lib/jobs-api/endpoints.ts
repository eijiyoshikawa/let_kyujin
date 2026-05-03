import { jobsApiGet, type JobsApiRequestOptions } from "./client"
import type {
  HwEmployerJobsParams,
  HwEmployerJobsResponse,
  HwJobDetailResponse,
  HwJobListResponse,
  HwListJobsParams,
  HwMetaResponse,
} from "./types"

type FetchOptions = Pick<JobsApiRequestOptions, "signal" | "revalidate" | "cache">

/** GET /api/jobs — 求人一覧 */
export function listHwJobs(
  params: HwListJobsParams = {},
  options: FetchOptions = {},
): Promise<HwJobListResponse> {
  return jobsApiGet<HwJobListResponse>("/api/jobs", {
    query: {
      prefecture: params.prefecture,
      jobType: params.jobType,
      employmentType: params.employmentType,
      minSalary: params.minSalary,
      q: params.q,
      offset: params.offset,
      limit: params.limit,
    },
    revalidate: options.revalidate ?? 300,
    cache: options.cache,
    signal: options.signal,
  })
}

/** GET /api/jobs/{kjno} — 求人詳細 */
export function getHwJob(
  kjno: string,
  options: FetchOptions = {},
): Promise<HwJobDetailResponse> {
  return jobsApiGet<HwJobDetailResponse>(
    `/api/jobs/${encodeURIComponent(kjno)}`,
    {
      revalidate: options.revalidate ?? 600,
      cache: options.cache,
      signal: options.signal,
    },
  )
}

/** GET /api/employers/{hojinno}/jobs — 事業所別求人 */
export function getHwEmployerJobs(
  hojinno: string,
  params: HwEmployerJobsParams = {},
  options: FetchOptions = {},
): Promise<HwEmployerJobsResponse> {
  return jobsApiGet<HwEmployerJobsResponse>(
    `/api/employers/${encodeURIComponent(hojinno)}/jobs`,
    {
      query: { offset: params.offset, limit: params.limit },
      revalidate: options.revalidate ?? 300,
      cache: options.cache,
      signal: options.signal,
    },
  )
}

/** GET /api/meta — メタ情報 */
export function getHwMeta(options: FetchOptions = {}): Promise<HwMetaResponse> {
  return jobsApiGet<HwMetaResponse>("/api/meta", {
    revalidate: options.revalidate ?? 3_600,
    cache: options.cache,
    signal: options.signal,
  })
}
