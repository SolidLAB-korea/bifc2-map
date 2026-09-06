import { useI18n } from "../i18n";

const guideContent = {
  ko: {
    title: "BIFC2 스퀘어가든 방문 안내",
    intro:
      "BIFC2 스퀘어가든 안내지도는 건물 내 매장과 편의시설을 빠르게 찾을 수 있도록 층별 위치와 이동 경로를 제공합니다.",
    items: [
      {
        title: "매장 찾기",
        body: "매장명, 업종, 층수 또는 키워드를 검색하면 관련 매장과 위치 설명을 확인할 수 있습니다."
      },
      {
        title: "층별 지도",
        body: "1F, 2F, 3F 버튼으로 층을 선택하고 지도 위 아이콘을 눌러 매장 위치와 상세 정보를 확인하세요."
      },
      {
        title: "길찾기 안내",
        body: "1층은 안내데스크를 출발점으로, 2층과 3층은 중앙 에스컬레이터를 기준으로 통행로 경로를 안내합니다."
      }
    ],
    note:
      "영업시간, 전화번호, 행사 일정은 매장 운영에 따라 변경될 수 있습니다. 방문 전 매장 상세 페이지의 외부 링크나 공식 SNS를 함께 확인해 주세요."
  },
  en: {
    title: "BIFC2 Square Garden visitor guide",
    intro:
      "The BIFC2 Square Garden map helps visitors find stores and facilities with floor locations and route guidance.",
    items: [
      {
        title: "Find a store",
        body: "Search by store name, category, floor, or keyword to see matching stores and location details."
      },
      {
        title: "Floor maps",
        body: "Choose 1F, 2F, or 3F, then select a map icon to view the store location and details."
      },
      {
        title: "Route guidance",
        body: "Routes start at the information desk on 1F and use the central escalator as the starting point on 2F and 3F."
      }
    ],
    note:
      "Hours, phone numbers, and event schedules may change. Check the store detail page and its official links or social channels before visiting."
  }
} as const;

export default function SiteGuide() {
  const { language } = useI18n();
  const content = guideContent[language];

  return (
    <section className="border-y border-slate-200 py-5 sm:py-7" aria-labelledby="site-guide-title">
      <details className="group sm:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-black text-primary">
          <span>{content.title}</span>
          <span className="text-accent group-open:rotate-45" aria-hidden="true">+</span>
        </summary>
        <p className="mt-3 text-sm leading-6 text-slate-600">{content.intro}</p>
        <div className="mt-4 grid gap-3">
          {content.items.map((item) => (
            <article key={item.title} className="border-l-2 border-accent/30 pl-3">
              <h3 className="text-sm font-black text-primary">{item.title}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">{item.body}</p>
            </article>
          ))}
        </div>
        <p className="mt-4 rounded-lg bg-appbg px-3 py-2 text-xs font-bold leading-5 text-slate-600">{content.note}</p>
      </details>
      <div className="hidden sm:block">
      <div className="max-w-3xl">
        <h2 id="site-guide-title" className="text-xl font-black text-primary sm:text-2xl">
          {content.title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">{content.intro}</p>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-3 sm:gap-6">
        {content.items.map((item) => (
          <article key={item.title} className="border-t-2 border-accent/30 pt-3">
            <h3 className="text-sm font-black text-primary sm:text-base">{item.title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">{item.body}</p>
          </article>
        ))}
      </div>
      <p className="mt-5 rounded-lg bg-appbg px-4 py-3 text-xs font-bold leading-5 text-slate-600 sm:text-sm">{content.note}</p>
      </div>
    </section>
  );
}
