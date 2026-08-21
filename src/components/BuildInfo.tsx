function formatBuildTime(value?: string) {
  if (!value) return "로컬 실행";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "빌드 시각 확인 불가";

  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}

export default function BuildInfo() {
  const version = import.meta.env.VITE_APP_VERSION;
  const shortVersion = version ? version.slice(0, 7) : "local";
  const buildTime = formatBuildTime(import.meta.env.VITE_BUILD_TIME);

  return (
    <p className="mt-1 text-[11px] font-bold text-slate-400" title={`빌드 커밋 ${version ?? "local"}`}>
      배포 버전 {shortVersion} · {buildTime}
    </p>
  );
}
