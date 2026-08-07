import TicketDetail from "@/app/component/tickets/TicketDetail";

export const metadata = {
  title: "Chi Tiết Vé - Cinema Booking",
  description: "Xem chi tiết vé đã đặt",
};

export default async function MyTicketsCodePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const resolvedParams = await params;
  return <TicketDetail code={resolvedParams?.code || ""} />;
}
