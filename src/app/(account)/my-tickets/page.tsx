import TicketHistory from "@/app/component/tickets/TicketHistory";

export const metadata = {
  title: "Vé của tôi - Cinema Booking",
  description: "Xem lịch sử vé đã đặt",
};

export default function MyTicketsPage() {
  return <TicketHistory />;
}
