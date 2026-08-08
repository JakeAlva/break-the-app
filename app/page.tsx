import ArcadePage, { metadata as arcadeMetadata, viewport as arcadeViewport } from "./arcade/page";

export const metadata = arcadeMetadata;
export const viewport = arcadeViewport;

export default function Home() {
  return <ArcadePage />;
}
