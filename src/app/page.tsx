import { WasteCollectionApp } from "@/components/waste-collection-app";
import { getWasteDataset } from "@/lib/waste-data";

export default function Home() {
  const dataset = getWasteDataset();

  return <WasteCollectionApp data={dataset} />;
}
