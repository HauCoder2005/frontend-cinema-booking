import { Be_Vietnam_Pro } from "next/font/google";
import PricingAdminPage from "../../../component/pricing/PricingAdminPage";

const beVN = Be_Vietnam_Pro({
  subsets: ["vietnamese"],
  weight: ["600", "700", "800"],
});

export default function Page() {
  return (
    <div className={beVN.className}>
      <PricingAdminPage />
    </div>
  );
}