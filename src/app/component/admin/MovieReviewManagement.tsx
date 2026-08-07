"use client";

import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";

import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

import { notify } from "@/lib/notifications";

import { MovieReviewAdmin } from "@/types/data/movie-reviews-admin/movie-review-admin";
import type {
  IAdminReviewFilterState,
  IAdminReviewMovieOption,
  IAdminReviewRow,
} from "@/types/data/movie-reviews-admin/type";

function formatDateTime(v?: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString("vi-VN");
}

function initials(name: string) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/);
  const a = parts[0]?.[0] ?? "";
  const b = parts[parts.length - 1]?.[0] ?? "";
  return (a + b).toUpperCase() || "U";
}

function Stars({ value }: { value: number }) {
  const v = Math.max(0, Math.min(5, Math.floor(value || 0)));
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) =>
        i < v ? (
          <StarRoundedIcon key={i} fontSize="small" className="text-amber-500" />
        ) : (
          <StarBorderRoundedIcon
            key={i}
            fontSize="small"
            className="text-slate-300"
          />
        ),
      )}
    </div>
  );
}

function normalizeHidden(v: any): boolean {
  return v === true || v === 1 || v === "1";
}

function readHidden(row: any): boolean {
  const raw = row?.hidden ?? row?.isHidden ?? row?.is_hidden;
  return normalizeHidden(raw);
}

function StatusPill({ hidden }: { hidden: boolean }) {
  const cfg = hidden
    ? { label: "Ẩn", cls: "bg-rose-50 text-rose-700 border-rose-200" }
    : {
        label: "Hiện",
        cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${cfg.cls}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
      {cfg.label}
    </span>
  );
}

type ConfirmPayload = {
  id: number;
  nextHidden: boolean;
  prevHidden: boolean;
  rawHidden: any;
  row?: IAdminReviewRow;
};

const defaultFilter: IAdminReviewFilterState = {
  page: 1,
  perPage: 10,
  movieId: null,
  rating: null,
  hidden: null,
  keyword: "",
};

export default function MovieReviewManagement() {
  const qc = useQueryClient();

  const [filters, setFilters] =
    React.useState<IAdminReviewFilterState>(defaultFilter);
  const [keywordInput, setKeywordInput] = React.useState("");

  const [openView, setOpenView] = React.useState(false);
  const [viewRow, setViewRow] = React.useState<IAdminReviewRow | null>(null);

  const [openConfirm, setOpenConfirm] = React.useState(false);
  const [confirmData, setConfirmData] = React.useState<ConfirmPayload | null>(
    null,
  );

  const [pendingId, setPendingId] = React.useState<number | null>(null);
  const toastLoadingIdRef = React.useRef<string | number | null>(null);

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        page: 1,
        keyword: keywordInput.trim(),
      }));
    }, 350);

    return () => window.clearTimeout(t);
  }, [keywordInput]);

  const qMovies = useQuery({
    ...MovieReviewAdmin.getMovies(),
  });

  const qReviews = useQuery({
    ...MovieReviewAdmin.getAll({
      page: filters.page,
      perPage: filters.perPage,
      movieId: filters.movieId,
      rating: filters.rating,
      hidden: filters.hidden,
      keyword: filters.keyword,
    }),
  });

  const movies: IAdminReviewMovieOption[] = qMovies.data?.data ?? [];
  const rows: IAdminReviewRow[] = qReviews.data?.data ?? [];
  const meta = qReviews.data?.meta;

  const total = Number(meta?.totalItems ?? meta?.total ?? 0);
  const page = Number(meta?.page ?? filters.page);
  const perPage = Number(meta?.pageSize ?? meta?.perPage ?? filters.perPage);
  const totalPages = Number(meta?.totalPages ?? Math.max(1, Math.ceil(total / perPage)));
  const showingFrom = total === 0 ? 0 : (page - 1) * perPage + 1;
  const showingTo = total === 0 ? 0 : Math.min(page * perPage, total);
  const shouldShowPagination = totalPages > 1;

  React.useEffect(() => {
    if (filters.page > totalPages) {
      setFilters((prev) => ({
        ...prev,
        page: 1,
      }));
    }
  }, [filters.page, totalPages]);

  const isLoading = qMovies.isLoading || qReviews.isLoading;
  const isError = qMovies.isError || qReviews.isError;

  const selectedMovieTitle =
    filters.movieId != null
      ? movies.find((m) => m.movieId === filters.movieId)?.movieTitle ?? ""
      : "Tất cả phim";

  const updateFilters = (patch: Partial<IAdminReviewFilterState>) => {
    setFilters((prev) => ({
      ...prev,
      ...patch,
      page: patch.page ?? 1,
    }));
  };

  const setPage = (nextPage: number) => {
    setFilters((prev) => ({
      ...prev,
      page: Math.min(Math.max(1, nextPage), totalPages),
    }));
  };

  const resetFilters = () => {
    setKeywordInput("");
    setFilters(defaultFilter);
  };

  const listPredicate = (q: any) =>
    Array.isArray(q.queryKey) &&
    q.queryKey[0] === MovieReviewAdmin.queryKeys.list;

  const mSetVisibility = useMutation({
    mutationFn: async (p: {
      id: number;
      nextHidden: boolean;
      prevHidden: boolean;
      rawHidden: any;
    }) => {
      if (!Number.isFinite(p.id)) {
        throw new Error("Invalid review id: " + String(p.id));
      }

      setPendingId(p.id);

      return p.nextHidden
        ? MovieReviewAdmin.hide(p.id).queryFn()
        : MovieReviewAdmin.unhide(p.id).queryFn();
    },

    onMutate: async (p) => {
      await qc.cancelQueries({ predicate: listPredicate });
      const prev = qc.getQueriesData({ predicate: listPredicate });

      qc.setQueriesData({ predicate: listPredicate }, (old: any) => {
        if (!old?.data || !Array.isArray(old.data)) return old;
        return {
          ...old,
          data: old.data.map((r: IAdminReviewRow) =>
            r.id === p.id ? ({ ...r, hidden: p.nextHidden } as any) : r,
          ),
        };
      });

      return { prev };
    },

    onError: (_e, _p, ctx) => {
      if (ctx?.prev) {
        for (const [key, data] of ctx.prev) qc.setQueryData(key, data);
      }
    },

    onSuccess: async () => {
      await qc.invalidateQueries({ predicate: listPredicate });
      await qc.refetchQueries({ predicate: listPredicate });
    },

    onSettled: () => {
      setPendingId(null);
    },
  });

  const openConfirmToggle = (payload: ConfirmPayload) => {
    setConfirmData(payload);
    setOpenConfirm(true);
  };

  const closeConfirm = () => {
    setOpenConfirm(false);
    setConfirmData(null);
  };

  const runToggle = (payload: ConfirmPayload) => {
    const loadingText = payload.nextHidden
      ? "Đang ẩn đánh giá..."
      : "Đang hiện đánh giá...";
    toastLoadingIdRef.current = notify.loading(loadingText);

    mSetVisibility.mutate(
      {
        id: payload.id,
        nextHidden: payload.nextHidden,
        prevHidden: payload.prevHidden,
        rawHidden: payload.rawHidden,
      },
      {
        onSuccess: (res: any) => {
          const serverMsg = String(res?.message ?? "").trim();
          const fallbackMsg = payload.nextHidden
            ? "Đã ẩn thành công"
            : "Đã hiện thành công";

          const msg =
            serverMsg &&
            !/^ok$/i.test(serverMsg) &&
            !/success$/i.test(serverMsg) &&
            serverMsg.length >= 3
              ? serverMsg
              : fallbackMsg;

          notify.success(msg, {
            icon: payload.nextHidden ? (
              <VisibilityOffRoundedIcon fontSize="small" />
            ) : (
              <VisibilityRoundedIcon fontSize="small" />
            ),
          });
        },

        onError: (err: any) => {
          const msg =
            String(err?.message ?? "").trim() ||
            (payload.nextHidden
              ? "Ẩn đánh giá thất bại"
              : "Hiện đánh giá thất bại");

          notify.error(msg);
        },

        onSettled: () => {
          if (toastLoadingIdRef.current != null) {
            notify.dismiss(toastLoadingIdRef.current);
            toastLoadingIdRef.current = null;
          }
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-white px-6 py-6">
      

      <div className="w-full">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Quản lý đánh giá
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Kiểm soát nội dung phản hồi từ khách hàng
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
            <div className="flex w-full max-w-[520px] min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
              <SearchOutlinedIcon fontSize="small" className="text-slate-400" />
              <input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder="Tìm khách hàng, email, phim, nội dung..."
                className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="flex w-full flex-col gap-3 md:flex-row md:flex-wrap 2xl:w-auto 2xl:justify-end">
              <div className="w-full min-w-0 md:w-[280px]">
                <select
                  value={filters.movieId ?? ""}
                  onChange={(e) =>
                    updateFilters({
                      movieId: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  title={selectedMovieTitle}
                  className="h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
                >
                  <option value="">Tất cả phim</option>
                  {movies.map((m) => (
                    <option key={m.movieId} value={String(m.movieId)}>
                      {m.movieTitle}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full min-w-0 md:w-[210px]">
                <select
                  value={filters.rating ?? ""}
                  onChange={(e) =>
                    updateFilters({
                      rating: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  className="h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
                >
                  <option value="">Mọi xếp hạng</option>
                  <option value="5">5 sao</option>
                  <option value="4">4 sao</option>
                  <option value="3">3 sao</option>
                  <option value="2">2 sao</option>
                  <option value="1">1 sao</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {[
              { k: "ALL", label: "Tất cả" },
              { k: "VISIBLE", label: "Đang hiển thị" },
              { k: "HIDDEN", label: "Đã ẩn" },
            ].map((t) => {
              const active =
                (t.k === "ALL" && filters.hidden === null) ||
                (t.k === "VISIBLE" && filters.hidden === false) ||
                (t.k === "HIDDEN" && filters.hidden === true);

              return (
                <button
                  key={t.k}
                  onClick={() =>
                    updateFilters({
                      hidden:
                        t.k === "ALL" ? null : t.k === "VISIBLE" ? false : true,
                    })
                  }
                  className={[
                    "rounded-full px-4 py-2 text-sm font-semibold transition",
                    active
                      ? "bg-rose-600 text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {t.label}
                </button>
              );
            })}

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 md:ml-auto"
            >
              <RestartAltRoundedIcon fontSize="small" />
              Đặt lại bộ lọc
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="relative overflow-x-auto">
            <table className="min-w-[1120px] w-full">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                  <th className="px-5 py-4">Khách hàng</th>
                  <th className="px-5 py-4">Phim</th>
                  <th className="px-5 py-4">Xếp hạng</th>
                  <th className="px-5 py-4">Nội dung đánh giá</th>
                  <th className="px-5 py-4">Ngày đăng</th>
                  <th className="px-5 py-4">Trạng thái</th>
                  <th className="sticky right-0 bg-slate-50 px-5 py-4 text-right">
                    Hành động
                  </th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-10 text-center text-sm text-slate-500"
                    >
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-10 text-center text-sm text-rose-600"
                    >
                      Lỗi tải dữ liệu.
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-10 text-center text-sm text-slate-500"
                    >
                      Không có dữ liệu.
                    </td>
                  </tr>
                ) : (
                  rows.map((r: any) => {
                    const hidden = readHidden(r);
                    const nextHidden = !hidden;

                    return (
                      <tr key={r.id} className="border-t border-slate-200">
                        <td className="px-5 py-4 align-top">
                          <div className="flex items-center gap-3">
                            <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-200 text-sm font-bold text-slate-700">
                              {initials(r.userFullName)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900">
                                {r.userFullName}
                              </div>
                              <div className="truncate text-xs text-slate-500">
                                {r.userEmail}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 align-top font-semibold text-slate-900">
                          <div className="max-w-[260px] break-words">
                            {r.movieTitle}
                          </div>
                        </td>

                        <td className="px-5 py-4 align-top">
                          <Stars value={r.rating} />
                        </td>

                        <td className="px-5 py-4 align-top">
                          <div className="max-w-[420px] truncate text-sm text-slate-700">
                            {r.comment ?? ""}
                          </div>
                        </td>

                        <td className="px-5 py-4 align-top text-sm text-slate-600">
                          {formatDateTime(r.createdAt)}
                        </td>

                        <td className="px-5 py-4 align-top">
                          <StatusPill hidden={hidden} />
                        </td>

                        <td className="sticky right-0 bg-white px-5 py-4 align-top">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setViewRow(r);
                                setOpenView(true);
                              }}
                              className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50"
                              title="Chi tiết"
                            >
                              <InfoOutlinedIcon fontSize="small" />
                            </button>

                            <button
                              type="button"
                              disabled={pendingId === r.id}
                              onClick={() => {
                                const rawHidden =
                                  r?.hidden ?? r?.isHidden ?? r?.is_hidden;

                                openConfirmToggle({
                                  id: r.id,
                                  nextHidden,
                                  prevHidden: hidden,
                                  rawHidden,
                                  row: r,
                                });
                              }}
                              className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                              title={hidden ? "Hiện lại" : "Ẩn"}
                            >
                              {hidden ? (
                                <VisibilityOutlinedIcon fontSize="small" />
                              ) : (
                                <VisibilityOffOutlinedIcon fontSize="small" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-600">
              Hiển thị {showingFrom} đến {showingTo} trong tổng số {total} đánh giá
            </div>

            {shouldShowPagination ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
                >
                  Trước
                </button>

                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                  {page} / {totalPages}
                </div>

                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <Dialog
        open={openView}
        onClose={() => setOpenView(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chi tiết đánh giá</DialogTitle>
        <DialogContent>
          <div className="space-y-2 text-sm">
            <div>
              <b>Khách hàng:</b> {viewRow?.userFullName}
            </div>
            <div>
              <b>Email:</b> {viewRow?.userEmail}
            </div>
            <div>
              <b>Phim:</b> {viewRow?.movieTitle}
            </div>

            <div className="flex items-center gap-2">
              <b>Đánh giá:</b> {viewRow ? <Stars value={viewRow.rating} /> : null}
            </div>

            <div>
              <b>Ngày đăng:</b> {formatDateTime(viewRow?.createdAt)}
            </div>

            <div>
              <b>Trạng thái:</b>{" "}
              {viewRow ? (readHidden(viewRow as any) ? "Ẩn" : "Hiện") : "-"}
            </div>

            <div className="pt-2">
              <b>Nội dung:</b>
              <div className="mt-1 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-3">
                {viewRow?.comment ?? ""}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openConfirm}
        onClose={closeConfirm}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle className="font-extrabold text-slate-900">
          Xác nhận thao tác
        </DialogTitle>

        <DialogContent>
          <div className="space-y-2 text-sm text-slate-700">
            <div>
              {confirmData?.nextHidden ? (
                <>
                  Bạn có chắc chắn muốn{" "}
                  <b className="text-rose-600">ẩn</b> đánh giá này khỏi giao diện
                  người dùng không?
                </>
              ) : (
                <>
                  Bạn có chắc chắn muốn{" "}
                  <b className="text-emerald-600">hiện</b> lại đánh giá này không?
                </>
              )}
            </div>

            {confirmData?.row ? (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="font-semibold text-slate-900">
                  {confirmData.row.movieTitle ?? "-"}
                </div>
                <div className="text-xs text-slate-500">
                  {confirmData.row.userFullName ?? "-"} •{" "}
                  {confirmData.row.userEmail ?? "-"}
                </div>
                <div className="mt-2 line-clamp-3 text-sm text-slate-700">
                  {confirmData.row.comment ?? ""}
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>

        <DialogActions className="px-6 pb-4">
          <Button onClick={closeConfirm} variant="outlined">
            Huỷ
          </Button>

          <Button
            onClick={() => {
              if (!confirmData) return;
              closeConfirm();
              runToggle(confirmData);
            }}
            variant="contained"
            disabled={confirmData?.id != null && pendingId === confirmData.id}
            style={{
              background: confirmData?.nextHidden ? "#e11d48" : "#059669",
            }}
          >
            {confirmData?.nextHidden ? "Ẩn" : "Hiện"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}