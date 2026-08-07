"use client"

export default function DashBoardComp() {


    return <>
        <>
            <div className="flex h-screen w-full">
                {/* Main Content */}
                <main className="flex flex-1 flex-col overflow-y-auto bg-background-dark">
                    {/* Top Bar */}
                    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-surface-border bg-background-dark/80 px-8 py-4 backdrop-blur-md">
                        <div className="flex w-full max-w-md items-center rounded-lg bg-surface-dark px-4 py-2 ring-1 ring-surface-border focus-within:ring-primary/50 transition-all">
                            <span className="material-symbols-outlined text-gray-400">
                                search
                            </span>
                            <input
                                className="ml-3 w-full bg-transparent text-sm text-white placeholder-gray-500 outline-none focus:outline-none border-none focus:ring-0 p-0"
                                placeholder="Tìm kiếm phim, đơn hàng, khách hàng..."
                                type="text"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="relative rounded-full p-2 text-gray-400 hover:bg-surface-border hover:text-white transition-colors">
                                <span className="material-symbols-outlined">notifications</span>
                                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background-dark" />
                            </button>
                            <button className="flex items-center gap-2 rounded-lg bg-surface-dark border border-surface-border px-3 py-2 text-sm font-medium text-white hover:bg-surface-border transition-colors">
                                <span className="material-symbols-outlined text-base">
                                    calendar_today
                                </span>
                                <span>24/05/2024</span>
                            </button>
                        </div>
                    </header>
                    <div className="p-8 pb-20">
                        {/* Header Section */}
                        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <h2 className="text-3xl font-bold text-white tracking-tight">
                                    Tổng Quan
                                </h2>
                                <p className="mt-1 text-gray-400">
                                    Chào mừng trở lại! Đây là tình hình rạp hôm nay.
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button className="flex items-center gap-2 rounded-lg bg-surface-dark px-4 py-2 text-sm font-medium text-gray-300 hover:bg-surface-border transition-colors">
                                    <span className="material-symbols-outlined text-lg">
                                        download
                                    </span>
                                    Xuất báo cáo
                                </button>
                                <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
                                    <span className="material-symbols-outlined text-lg">add</span>
                                    Tạo suất chiếu mới
                                </button>
                            </div>
                        </div>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                            {/* Revenue */}
                            <div className="group relative overflow-hidden rounded-xl border border-surface-border bg-surface-dark p-6 transition-all hover:border-primary/50">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-400">
                                            Doanh thu hôm nay
                                        </p>
                                        <h3 className="mt-2 text-2xl font-bold text-white">
                                            24.500.000 đ
                                        </h3>
                                    </div>
                                    <div className="rounded-lg bg-surface-border/40 p-2 text-gray-300">
                                        <span className="material-symbols-outlined">payments</span>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-2">
                                    <span className="flex items-center text-xs font-medium text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                        <span className="material-symbols-outlined text-sm mr-0.5">
                                            trending_up
                                        </span>
                                        +12%
                                    </span>
                                    <span className="text-xs text-gray-500">so với hôm qua</span>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                            </div>
                            {/* Tickets */}
                            <div className="group relative overflow-hidden rounded-xl border border-surface-border bg-surface-dark p-6 transition-all hover:border-primary/50">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-400">
                                            Số vé bán ra
                                        </p>
                                        <h3 className="mt-2 text-2xl font-bold text-white">342</h3>
                                    </div>
                                    <div className="rounded-lg bg-surface-border/40 p-2 text-gray-300">
                                        <span className="material-symbols-outlined">
                                            confirmation_number
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-2">
                                    <span className="flex items-center text-xs font-medium text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                        <span className="material-symbols-outlined text-sm mr-0.5">
                                            trending_up
                                        </span>
                                        +8%
                                    </span>
                                    <span className="text-xs text-gray-500">so với hôm qua</span>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                            </div>
                            {/* Active Screenings */}
                            <div className="group relative overflow-hidden rounded-xl border border-surface-border bg-surface-dark p-6 transition-all hover:border-primary/50">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-400">
                                            Suất chiếu đang chạy
                                        </p>
                                        <h3 className="mt-2 text-2xl font-bold text-white">8</h3>
                                    </div>
                                    <div className="rounded-lg bg-surface-border/40 p-2 text-gray-300">
                                        <span className="material-symbols-outlined">play_circle</span>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-2">
                                    <span className="flex items-center text-xs font-medium text-gray-400 bg-gray-500/10 px-1.5 py-0.5 rounded">
                                        <span className="material-symbols-outlined text-sm mr-0.5">
                                            remove
                                        </span>
                                        0%
                                    </span>
                                    <span className="text-xs text-gray-500">ổn định</span>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                            </div>
                            {/* Empty Seats */}
                            <div className="group relative overflow-hidden rounded-xl border border-surface-border bg-surface-dark p-6 transition-all hover:border-primary/50">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-400">Ghế trống</p>
                                        <h3 className="mt-2 text-2xl font-bold text-white">55%</h3>
                                    </div>
                                    <div className="rounded-lg bg-surface-border/40 p-2 text-gray-300">
                                        <span className="material-symbols-outlined">event_seat</span>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-2">
                                    <span className="flex items-center text-xs font-medium text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded">
                                        <span className="material-symbols-outlined text-sm mr-0.5">
                                            trending_down
                                        </span>
                                        -5%
                                    </span>
                                    <span className="text-xs text-gray-500">tỷ lệ lấp đầy tăng</span>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                            </div>
                        </div>
                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            {/* Chart Section */}
                            <div className="rounded-xl border border-surface-border bg-surface-dark p-6 lg:col-span-2">
                                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                                    <h3 className="text-lg font-bold text-white">
                                        Biểu đồ doanh thu
                                    </h3>
                                    <div className="flex rounded-lg bg-surface-darker p-1 border border-surface-border">
                                        <button className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-white shadow-sm transition-all">
                                            Theo tuần
                                        </button>
                                        <button className="rounded-md px-3 py-1 text-xs font-medium text-gray-400 hover:text-white transition-all">
                                            Theo tháng
                                        </button>
                                    </div>
                                </div>
                                {/* Pseudo Chart Implementation using Tailwind utility classes for visualization */}
                                <div className="relative h-64 w-full">
                                    <div className="absolute bottom-0 left-0 right-0 top-0 flex items-end justify-between gap-2 px-2">
                                        {/* Bar 1 */}
                                        <div className="group relative flex h-full w-full flex-col justify-end">
                                            <div
                                                className="relative w-full rounded-t-sm bg-surface-border transition-all group-hover:bg-primary/60"
                                                style={{ height: "40%" }}
                                            >
                                                <div className="absolute -top-8 left-1/2 hidden -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:block">
                                                    12tr
                                                </div>
                                            </div>
                                            <span className="mt-2 text-center text-xs text-gray-500">
                                                T2
                                            </span>
                                        </div>
                                        {/* Bar 2 */}
                                        <div className="group relative flex h-full w-full flex-col justify-end">
                                            <div
                                                className="relative w-full rounded-t-sm bg-surface-border transition-all group-hover:bg-primary/60"
                                                style={{ height: "65%" }}
                                            >
                                                <div className="absolute -top-8 left-1/2 hidden -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:block">
                                                    18.5tr
                                                </div>
                                            </div>
                                            <span className="mt-2 text-center text-xs text-gray-500">
                                                T3
                                            </span>
                                        </div>
                                        {/* Bar 3 */}
                                        <div className="group relative flex h-full w-full flex-col justify-end">
                                            <div
                                                className="relative w-full rounded-t-sm bg-surface-border transition-all group-hover:bg-primary/60"
                                                style={{ height: "55%" }}
                                            >
                                                <div className="absolute -top-8 left-1/2 hidden -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:block">
                                                    15tr
                                                </div>
                                            </div>
                                            <span className="mt-2 text-center text-xs text-gray-500">
                                                T4
                                            </span>
                                        </div>
                                        {/* Bar 4 */}
                                        <div className="group relative flex h-full w-full flex-col justify-end">
                                            <div
                                                className="relative w-full rounded-t-sm bg-surface-border transition-all group-hover:bg-primary/60"
                                                style={{ height: "80%" }}
                                            >
                                                <div className="absolute -top-8 left-1/2 hidden -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:block">
                                                    22tr
                                                </div>
                                            </div>
                                            <span className="mt-2 text-center text-xs text-gray-500">
                                                T5
                                            </span>
                                        </div>
                                        {/* Bar 5 (Current High) */}
                                        <div className="group relative flex h-full w-full flex-col justify-end">
                                            <div
                                                className="relative w-full rounded-t-sm bg-primary transition-all shadow-[0_0_15px_rgba(234,42,51,0.4)]"
                                                style={{ height: "90%" }}
                                            >
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-primary px-2 py-1 text-xs font-bold text-white">
                                                    24.5tr
                                                </div>
                                            </div>
                                            <span className="mt-2 text-center text-xs font-bold text-white">
                                                Hôm nay
                                            </span>
                                        </div>
                                        {/* Bar 6 */}
                                        <div className="group relative flex h-full w-full flex-col justify-end">
                                            <div
                                                className="relative w-full rounded-t-sm bg-surface-border/50 transition-all"
                                                style={{ height: "10%" }}
                                            ></div>
                                            <span className="mt-2 text-center text-xs text-gray-500">
                                                T7
                                            </span>
                                        </div>
                                        {/* Bar 7 */}
                                        <div className="group relative flex h-full w-full flex-col justify-end">
                                            <div
                                                className="relative w-full rounded-t-sm bg-surface-border/50 transition-all"
                                                style={{ height: "10%" }}
                                            ></div>
                                            <span className="mt-2 text-center text-xs text-gray-500">
                                                CN
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Top Movies */}
                            <div className="rounded-xl border border-surface-border bg-surface-dark p-6">
                                <div className="mb-6 flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-white">Top Phim</h3>
                                    <a
                                        className="text-xs font-medium text-primary hover:text-primary/80"
                                        href="#"
                                    >
                                        Xem tất cả
                                    </a>
                                </div>
                                <div className="flex flex-col gap-5">
                                    {/* Movie 1 */}
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="h-14 w-10 flex-shrink-0 overflow-hidden rounded bg-gray-800"
                                            data-alt="Poster for movie Mai"
                                            style={{
                                                backgroundImage:
                                                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA9v2YNA68MrDWzC8Or22Xz3IGxAEOVpiF5_FEXgdawxRod4cqOhRJeyhM0Gs86viBIiGnbZXtpCTMAlm-Avi_nZOlaj2rOtAgFs7j2Rt3vitKZe9q1FKG9qJ6_7YkJpD7sWqOGYaQAc-Pb4BMu2_cUqcpnxrq6PkiltNUFWbwlvNQMAwdeYqxSPt5N579IA13BdzYS7x4dVXc5Mq1Qmh3VQqQO_SuRUO86l6_w6F8Qe3frSLXzBiTfs6tyMcc8j5oU9K9svjoQxByf")',
                                                backgroundSize: "cover",
                                                backgroundPosition: "center"
                                            }}
                                        ></div>
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <h4 className="text-sm font-semibold text-white truncate max-w-[120px]">
                                                    Mai
                                                </h4>
                                                <span className="text-sm font-bold text-white">1.2 tỷ</span>
                                            </div>
                                            <div className="mt-2 h-1.5 w-full rounded-full bg-surface-darker">
                                                <div
                                                    className="h-1.5 rounded-full bg-primary"
                                                    style={{ width: "90%" }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Movie 2 */}
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="h-14 w-10 flex-shrink-0 overflow-hidden rounded bg-gray-800"
                                            data-alt="Poster for movie Dune Part Two"
                                            style={{
                                                backgroundImage:
                                                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB-HTPzP3MxMgG9vRSxu5xjEFQFz-wi6bO3kve8dxf8JlhGymgt3L4dl2aFp1LnDPLmd74-V339EFf8iZQFpgVo9nIrQ_S78YSCJZjy-xL3WEkmJGYDBOXXq_aYV15cNmy0ZaZMR3woGklp9PgObROWN9aG8-wA4xOwkLVDnNJBqwyiOIdAEFCK9jsBD6-_dG_8g2z14dBoGaIL_3BRxPeHYKdHPv6cjeMDhETZtmxmFn_DbOQC3YO7KP9Cx9W4gBk6xSC0i-bPCy6X")',
                                                backgroundSize: "cover",
                                                backgroundPosition: "center"
                                            }}
                                        ></div>
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <h4 className="text-sm font-semibold text-white truncate max-w-[120px]">
                                                    Dune: Part Two
                                                </h4>
                                                <span className="text-sm font-bold text-white">980 tr</span>
                                            </div>
                                            <div className="mt-2 h-1.5 w-full rounded-full bg-surface-darker">
                                                <div
                                                    className="h-1.5 rounded-full bg-primary/80"
                                                    style={{ width: "75%" }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Movie 3 */}
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="h-14 w-10 flex-shrink-0 overflow-hidden rounded bg-gray-800"
                                            data-alt="Poster for Kung Fu Panda 4"
                                            style={{
                                                backgroundImage:
                                                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDKYCf2CEXzbjXPfhcodIC8zgnn1_Q7OTsYhWfAA77Z-V7-YqMBE8D7fsc_UG3q2-4oq9bVS8ENq-iA7ONxuQvI6B8nWcx4FzHaldBHp2WvjG1W3hM_LRjJMP7WwtvBZmu3JwS8Ia6pgPZs5iXAqifZWfO_YOOD217RvxPIZEd-4t97AQgbKFpfSpX1g8UwCnGSTjvvXyoNeJ7RhQxFMiCKD2B34GbdkLKbP3K8gLLDY1zl4iHZ48MGY5IoN1HP93WCrkb0NzIGHl7P")',
                                                backgroundSize: "cover",
                                                backgroundPosition: "center"
                                            }}
                                        ></div>
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <h4 className="text-sm font-semibold text-white truncate max-w-[120px]">
                                                    Kung Fu Panda 4
                                                </h4>
                                                <span className="text-sm font-bold text-white">850 tr</span>
                                            </div>
                                            <div className="mt-2 h-1.5 w-full rounded-full bg-surface-darker">
                                                <div
                                                    className="h-1.5 rounded-full bg-primary/60"
                                                    style={{ width: "65%" }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Movie 4 */}
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="h-14 w-10 flex-shrink-0 overflow-hidden rounded bg-gray-800"
                                            data-alt="Poster for Godzilla x Kong"
                                            style={{
                                                backgroundImage:
                                                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAcxpcYlWCK9VMsFHcSIi5jHAMQ42GydWNJZ9sSKAvt-XKCOmF-sFbtFrNh1cD1wM0AKexe-vkv5DPhSLTFEceL7agR08O7D3cAqvNSQzrmsY3ZQqNlO6cfC1_4iJUDVi4DSJZanAH1wNl_o9KPGuwNjFdiUp1_evHACp9L3-83blROSXuLdM7InVXPttdZ8cltjxxW4NSaPjUBrTRB-b3GCaRAVRVLMSbrsk3Tzx-xAKb_LavM88u2qh71fNA147wNsgb5TbP35syS")',
                                                backgroundSize: "cover",
                                                backgroundPosition: "center"
                                            }}
                                        ></div>
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <h4 className="text-sm font-semibold text-white truncate max-w-[120px]">
                                                    Godzilla x Kong
                                                </h4>
                                                <span className="text-sm font-bold text-white">520 tr</span>
                                            </div>
                                            <div className="mt-2 h-1.5 w-full rounded-full bg-surface-darker">
                                                <div
                                                    className="h-1.5 rounded-full bg-primary/40"
                                                    style={{ width: "40%" }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Recent Activity / Orders Table */}
                        <div className="mt-6 rounded-xl border border-surface-border bg-surface-dark">
                            <div className="flex items-center justify-between border-b border-surface-border px-6 py-4">
                                <h3 className="text-lg font-bold text-white">Hoạt động gần đây</h3>
                                <button className="flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-lg">
                                        filter_list
                                    </span>
                                    Lọc
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-400">
                                    <thead className="bg-surface-darker text-xs uppercase text-gray-500">
                                        <tr>
                                            <th className="px-6 py-3 font-medium" scope="col">
                                                Khách hàng
                                            </th>
                                            <th className="px-6 py-3 font-medium" scope="col">
                                                Phim
                                            </th>
                                            <th className="px-6 py-3 font-medium" scope="col">
                                                Chi tiết
                                            </th>
                                            <th className="px-6 py-3 font-medium" scope="col">
                                                Thời gian
                                            </th>
                                            <th className="px-6 py-3 font-medium" scope="col">
                                                Trạng thái
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-surface-border">
                                        <tr className="group hover:bg-surface-darker/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-medium text-xs">
                                                        A
                                                    </div>
                                                    <span className="font-medium text-white">
                                                        Nguyễn Văn A
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-white">Dune: Part Two</td>
                                            <td className="px-6 py-4">2 vé • Ghế G12, G13</td>
                                            <td className="px-6 py-4">2 phút trước</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center rounded bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500 ring-1 ring-inset ring-emerald-500/20">
                                                    Thành công
                                                </span>
                                            </td>
                                        </tr>
                                        <tr className="group hover:bg-surface-darker/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-medium text-xs">
                                                        L
                                                    </div>
                                                    <span className="font-medium text-white">Lê Thị B</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-white">Mai</td>
                                            <td className="px-6 py-4">4 vé • Ghế F01-F04</td>
                                            <td className="px-6 py-4">15 phút trước</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center rounded bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500 ring-1 ring-inset ring-emerald-500/20">
                                                    Thành công
                                                </span>
                                            </td>
                                        </tr>
                                        <tr className="group hover:bg-surface-darker/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-medium text-xs">
                                                        T
                                                    </div>
                                                    <span className="font-medium text-white">Trần Văn C</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-white">Kung Fu Panda 4</td>
                                            <td className="px-6 py-4">1 vé • Ghế H10</td>
                                            <td className="px-6 py-4">32 phút trước</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center rounded bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-500 ring-1 ring-inset ring-yellow-500/20">
                                                    Chờ thanh toán
                                                </span>
                                            </td>
                                        </tr>
                                        <tr className="group hover:bg-surface-darker/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-medium text-xs">
                                                        H
                                                    </div>
                                                    <span className="font-medium text-white">
                                                        Hoàng Văn D
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-white">Mai</td>
                                            <td className="px-6 py-4">2 vé • Ghế K05, K06</td>
                                            <td className="px-6 py-4">1 giờ trước</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center rounded bg-red-500/10 px-2 py-1 text-xs font-medium text-red-500 ring-1 ring-inset ring-red-500/20">
                                                    Hủy
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex items-center justify-between border-t border-surface-border px-6 py-4">
                                <span className="text-xs text-gray-500">
                                    Hiển thị 4 trên 128 đơn hàng
                                </span>
                                <div className="flex gap-2">
                                    <button className="flex items-center justify-center rounded bg-surface-darker px-3 py-1 text-xs font-medium text-gray-400 hover:text-white border border-surface-border hover:border-gray-500 transition-all">
                                        Trước
                                    </button>
                                    <button className="flex items-center justify-center rounded bg-surface-darker px-3 py-1 text-xs font-medium text-gray-400 hover:text-white border border-surface-border hover:border-gray-500 transition-all">
                                        Sau
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            {/* Background decorative elements for "cinema feel" */}
            <div className="pointer-events-none fixed bottom-0 left-0 right-0 top-0 z-0 overflow-hidden opacity-10">
                <div className="absolute -right-1/4 top-0 h-[600px] w-[600px] rounded-full bg-primary blur-[150px]" />
            </div>
        </>

    </>
}