import type { AxiosRequestConfig } from 'axios'
import type { IHttpError, IPaginateResponse, IResponse, IServiceConstructorData } from './api'
import { Api } from './api'
import { useMutation } from '@tanstack/react-query'

/**
 * Implement common crud methods for a model
 */
export class ObjectsFactory<T> {
  list(params: Record<string, unknown>): IResponse<import("../data/movie-public/index").IMoviePublic[]> | Promise<IResponse<import("../data/movie-public/index").IMoviePublic[]>> {
    throw new Error("Method not implemented.")
  }
  service: Api

  path = ''

  queryKeys: Record<string, string> = {}

  model?: string

  headers = {}

  static factory<M>(data: IServiceConstructorData, queryKeys?: Record<string, string>) {
    return new ObjectsFactory<M>(data, queryKeys)
  }

  /**
   * Construct the base server client with endpoint param
   * @param endpoint
   * @param queryKeys
   */
  constructor({ path, model, headers }: IServiceConstructorData, queryKeys?: Record<string, string>) {
    this.service = new Api({ path })
    this.path = path
    this.queryKeys = queryKeys || {}
    if (model) this.model = model
    if (headers) this.headers = headers
  }

  /**
   * Find all model
   */
  findAll(config: AxiosRequestConfig = {}) {
    const { url = this.path, ...rest } = config

    return this.service.get<IPaginateResponse<T>>({ ...rest, url })
  }

  /**
   * Find all model
   */
  paginate<U = T>(config: AxiosRequestConfig = {}) {
    const { url = this.path, ...rest } = config

    return this.service.get<IPaginateResponse<U>>({ url, ...rest })
  }

  /**
   * Find one model
   */
  findOnePaginate(id: number | string, config: AxiosRequestConfig = {}) {
    const { url = `${this.path}/${id}`, ...rest } = config

    return this.service.get<IPaginateResponse<T>>({ url, ...rest })
  }

  /**
   * Fetch online model
   * @param id
   * @param config {AxiosRequestConfig}
   */
  findOne(id: number | string, config: AxiosRequestConfig = {}) {
    const { url = `${this.path}/${id}`, ...rest } = config

    return this.service.get<IResponse<T>>({ url, ...rest }).then(r => r.data)
  }

  /**
   * Create a model
   * @param data
   * @param config {AxiosRequestConfig}
   */
  create(data: unknown, config: AxiosRequestConfig = {}) {
    const { url = this.path, ...rest } = config

    return this.service.post<T>({ url, ...rest, data })
  }

  /**
   * Create FormData a model
   * @param data
   * @param config {AxiosRequestConfig}
   */
  createFormData(data: unknown, config: AxiosRequestConfig = {}) {
    const { url = this.path, ...rest } = config

    if (config.method === 'POST') return this.service.postFormData({ url, ...rest, data })
    else return this.service.putFormData({ url, ...rest, data })
  }

  /**
   * Update a model
   * @param id
   * @param data
   * @param config
   */
  update(id: number | string, data: unknown, config: AxiosRequestConfig = {}) {
    const { url = `${this.path}/${id}`, ...rest } = config

    return this.service.put<IResponse<T>>({ url, ...rest, data })
  }

  /**
   * Delete model
   * @param id
   * @param config
   */
  delete(id: number | string, config: AxiosRequestConfig = {}) {
    const { url = `${this.path}/${id}`, ...rest } = config

    return this.service.delete({ url, ...rest })
  }

  /**
   * Get the query key for the model
   * @param params
   */
  paginateQueryFactory(params?: any, headers?: Record<string, string>) {
    return {
      queryKey: [this.queryKeys.paginate, this.model, params],
      queryFn: () => {
        return this.paginate({ params, headers }).then(r => {
          return r.data
        })
      }
    }
  }

  findOneQueryFactory(id: number | string, options = {}) {
    return {
      queryKey: [this.queryKeys.findOne, this.model, id],
      queryFn: () => this.findOne(id).then(r => r.data),
      ...options
    }
  }

  getCommonMutations() {
    return {
      useCreateMutation: () => {
        return useMutation<T, IHttpError, Partial<T>>({
          mutationFn: data => {
            return this.create(data).then(r => r.data)
          }
        })
      },

      useCreateFormDataMutation: () => {
        return useMutation<T, IHttpError, Partial<T>>({
          mutationFn: data => {
            return this.createFormData(data).then(r => r.data as T)
          }
        })
      },

      useUpdateMutation: () => {
        return useMutation<IResponse<T>, IHttpError, { id: string | number; data: Partial<T> }>({
          mutationFn: ({ id, data }) => {
            return this.update(id, data).then(r => r.data)
          }
        })
      },

      useDeleteMutation: () => {
        return useMutation<unknown, IHttpError, string | number>({
          mutationFn: id => {
            return this.delete(id)
          }
        })
      }
    }
  }
}
