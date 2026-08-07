import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation'

import type { Dictionary } from 'lodash'
import { identity, pickBy } from 'lodash'

export function useRouteQuery() {
  const router = useRouter()
  const path = usePathname()
  const params = useParams()
  const searchQuery = useSearchParams()

  function serializeQuery<T extends object = Dictionary<unknown>>(query: T) {
    return pickBy(query, identity)
  }

  function updateQuery(query: Record<string, undefined | string | number>, replace = true) {
    const params = Object.fromEntries(searchQuery.entries())

    const newQuery = pickBy(
      {
        ...params,
        ...query
      },
      identity
    )

    const url = `${path}?${new URLSearchParams(newQuery as Record<string, string>).toString()}`

    if (replace) {
      router.replace(url)
    } else {
      router.push(url)
    }
  }

  return {
    router,
    params,
    path,
    searchQuery,
    updateQuery,
    serializeQuery
  }
}
