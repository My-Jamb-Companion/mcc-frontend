import {Icon} from "@mcc/ui";
import {Coins} from "lucide-react";

export default function GoalsProgress() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 bg-white p-8 max-md:p-0 max-md:pt-5">
      {/* Hero */}
      <GoalsProgressCard />

      {/* Weekly */}
      <MonthlyGoalCardPreview />

      {/* Monthly Progress */}
      <GoalsSummary />
    </div>
  );
}

function GoalsProgressCard() {
  return (
    <div className="relative flex justify-center pt-6">
      {/* Bottom Card */}
      <div className="relative w-full rounded-[32px] border-2 border-muted/30 pt-14 pb-4.5">
        <h2 className="text-center font-semibold text-gray-900 pt-5">
          Goals &amp; Progress
        </h2>
      </div>

      {/* Floating Header */}
      <div className="absolute -top-10 z-10 w-[88%] max-w-[920px] overflow-hidden rounded-[34px] border border-white/10 bg-[#242426] py-7">
        {/* Soft glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_20%,rgba(255,255,255,0.08),transparent_40%)]" />

        {/* Trophy */}
        <div className="relative flex justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="64"
            viewBox="0 0 73 64"
            fill="none"
          >
            <path
              d="M12.447 21.7829C12.0899 20.0629 11.3163 19.5229 10.8799 20.6629C10.3443 22.1029 10.7609 23.7429 11.6734 23.7429C12.5263 23.7429 12.7445 23.1829 12.447 21.7829Z"
              fill="white"
            />
            <path
              d="M52.5772 54.8031C51.2085 54.2231 45.7136 52.3231 43.6109 51.7031C41.1114 50.9631 41.1908 51.0231 41.1115 49.7031C40.7544 42.1231 40.3776 40.5831 39.604 41.3831C39.4056 41.5831 39.4253 45.4231 39.6435 48.2631C39.9212 51.7831 40.0799 51.9431 44.3052 53.2031C47.003 54.0031 48.0544 54.4431 49.1057 54.8431C42.1628 54.8431 28.3365 54.8631 28.3365 54.7831C28.3365 54.7431 29.9234 53.9631 31.8476 53.0231C36.1324 50.9431 35.7158 51.6231 35.577 46.9431C35.3588 40.2231 35.3786 40.2631 32.5023 39.1431C30.4789 38.3631 28.1778 37.0231 26.9479 35.9231C25.9759 35.0631 25.8568 35.0031 25.6188 35.3831C24.8848 36.5431 21.5126 36.8431 19.6876 35.9231C12.0107 31.9831 14.2126 18.0831 22.1672 20.3231C23.2979 20.6431 23.5955 20.6631 23.893 20.4431C25.361 19.4231 36.1722 18.8031 42.4803 18.7831C43.0357 18.7831 48.1933 19.3831 44.583 18.0231C40.9528 16.6431 29.6061 16.5631 24.4683 18.6431C24.012 18.8231 24.0319 17.0031 24.4882 16.5431C25.361 15.7031 32.3633 14.5631 39.3856 14.9231C42.9761 15.1031 46.2493 15.8831 47.9949 16.4231C48.5504 16.6031 48.9471 17.1231 48.9471 17.7231V18.2631C48.9471 19.8231 49.5422 21.1431 50.2365 21.1431C50.5539 21.1431 50.7722 20.5231 50.6135 20.1031C50.3159 19.3431 53.5493 17.3431 55.0768 17.3431C60.5716 17.3431 60.2144 26.3231 57.0405 31.4631C54.1245 36.1831 52.1409 36.9431 46.8444 35.3431C43.9482 34.4631 40.8933 34.2431 32.4031 35.3231C29.983 35.6431 30.7169 36.5831 33.8313 36.5231C41.3495 36.3631 45.4558 36.5031 45.0789 36.9031C44.6425 37.3831 42.6587 38.4631 41.3296 38.9231C39.2269 39.6631 40.3378 41.3231 42.1231 40.4831C43.4522 39.8431 45.6938 38.4431 46.6658 37.5431C47.499 36.7831 47.5784 36.7431 47.9949 37.0031C52.6963 40.0231 57.7546 36.7231 60.1747 29.0231C62.7734 20.7431 57.5166 13.4431 51.4267 16.9031L50.3554 17.5031L50.1373 16.8431C49.7802 15.7431 48.9272 14.9431 47.7172 14.5031C41.8851 12.4631 28.9713 12.3631 23.3971 15.3031C22.6433 15.7031 22.1672 16.5031 22.1672 17.3631C22.1672 17.4031 22.1672 19.1631 22.1672 19.1031L21.6118 18.9631C13.7365 16.9631 9.27315 28.2031 15.3036 34.8631C17.7237 37.5431 21.3539 38.4831 24.865 37.3431L26.0751 36.9431L26.7297 37.6031C27.7017 38.6031 30.221 40.0031 32.1451 40.6231L33.871 41.1631C34.0892 42.9631 34.1091 42.7031 33.99 50.5631C32.661 51.1631 25.361 54.4031 23.8732 54.8831C22.2862 55.3831 22.7623 56.5231 23.9525 56.5631C25.5593 56.6231 30.7368 56.6631 36.7474 56.6631C45.2971 56.6631 52.9938 56.9031 52.9739 56.9031C53.8071 57.0031 54.1642 55.4831 52.5772 54.8031Z"
              fill="white"
            />
            <path
              d="M25.6792 42.4225C25.4411 41.4625 24.1319 41.7225 24.2906 42.7025C24.4493 43.7025 23.5963 45.1625 22.5053 44.5225C21.3944 43.9025 21.4142 41.9425 23.6359 41.9225C23.8739 41.9225 24.2112 41.8225 24.3699 41.7225C25.1436 41.2025 23.1599 40.6825 22.0887 41.1225C20.6009 41.7425 20.3033 44.3624 21.6324 45.0624C23.5764 46.0624 26.1553 44.3825 25.6792 42.4225Z"
              fill="white"
            />
            <path
              d="M23.0997 22.6827C20.2035 20.5627 16.0972 22.0827 16.2559 26.8627C16.4345 31.7227 19.648 34.7627 24.0518 34.2227C25.6388 34.0227 25.6785 33.9827 25.1826 32.4027C22.8616 24.7227 24.2105 23.5027 23.0997 22.6827ZM22.4054 33.0427C19.8266 32.1827 18.5769 30.2627 18.438 27.0027C18.2991 23.3627 19.0529 22.2427 20.9572 23.2227L21.9095 23.7027L21.9491 25.2827C21.9888 27.0427 22.5641 30.2627 23.179 32.0427C23.6551 33.4427 23.6551 33.4627 22.4054 33.0427Z"
              fill="white"
            />
            <path
              d="M11.3565 16.2625C12.3087 16.9825 12.8443 16.2825 12.8443 14.3425C12.8443 11.6225 12.1103 10.2025 11.2375 11.2625C10.7812 11.8225 10.8804 15.9025 11.3565 16.2625Z"
              fill="white"
            />
            <path
              d="M52.3787 13.4226C53.8268 13.1826 54.7195 11.1426 53.7475 10.2626C53.1524 9.72259 52.8944 9.8426 53.0333 10.6026C53.192 11.4426 52.3787 12.7026 51.4266 12.2226C50.4546 11.7426 50.3752 9.7626 52.6565 9.7426C53.1326 9.7426 53.311 9.46259 52.9738 9.26259C51.9026 8.60259 50.0975 9.04261 49.5023 10.3826C48.8279 11.8626 50.1173 13.8026 52.3787 13.4226Z"
              fill="white"
            />
            <path
              d="M12.269 18.2427C12.269 18.8427 14.4312 18.7827 16.8712 18.1227C19.1127 17.5227 16.9704 16.8027 14.5503 17.3427C12.884 17.7227 12.269 17.9627 12.269 18.2427Z"
              fill="white"
            />
            <path
              d="M6.41691 17.7229C5.64327 17.8829 5.50441 18.4829 6.21854 18.6629C7.07153 18.8829 10.6223 18.6429 10.9794 18.3429C11.7729 17.6629 8.59898 17.2429 6.41691 17.7229Z"
              fill="white"
            />
            <path
              d="M54.3429 44.0026C55.2157 44.2426 55.4934 43.8426 55.4934 42.3826C55.4934 40.4826 55.3744 40.1426 54.6999 40.1426C54.3032 40.1426 54.1245 40.2626 54.0254 40.5826C53.7278 41.8026 53.9065 43.8826 54.3429 44.0026Z"
              fill="white"
            />
            <path
              d="M49.9785 33.9634C54.5608 36.3234 60.1548 26.1234 56.9214 21.2834C56.0486 19.9834 54.3623 19.3634 53.0333 19.8434C51.843 20.2834 49.6213 22.6234 49.8593 23.2234C50.1172 23.9234 49.5419 28.3834 48.9667 30.1434C48.1137 32.7034 48.213 33.0434 49.9785 33.9634ZM50.0577 31.7034C50.5735 30.2034 51.129 26.7034 51.129 24.9234C51.129 21.9634 54.0848 19.5034 55.6717 21.1234C57.1793 22.6434 55.6517 29.0234 53.1324 31.8034C51.6447 33.4434 49.4824 33.3834 50.0577 31.7034Z"
              fill="white"
            />
            <path
              d="M53.7277 48.6431C53.0532 50.4031 53.7477 52.3031 54.9776 52.0431C55.9099 51.8631 56.0884 50.4831 55.3941 48.7831C55.0569 47.9231 54.0253 47.8431 53.7277 48.6431Z"
              fill="white"
            />
            <path
              d="M60.0364 46.0624C59.1834 45.8824 56.1483 45.8225 55.7317 45.9825C54.2241 46.5425 57.6756 47.4225 59.6792 46.9825C60.4925 46.8025 60.7307 46.2024 60.0364 46.0624Z"
              fill="white"
            />
            <path
              d="M49.9992 45.862C49.6421 46.002 49.6818 46.462 50.0587 46.602C51.0108 46.982 53.9071 46.682 53.9071 46.222C53.927 45.782 50.9117 45.502 49.9992 45.862Z"
              fill="white"
            />
            <path
              d="M42.8381 21.7833C42.5207 21.2033 37.7995 20.8433 34.09 21.1433C30.9954 21.3833 28.0595 21.9833 26.6313 22.5633C25.2823 23.1233 25.5998 23.9833 26.9487 23.7433C28.8332 23.4033 36.0537 22.7233 38.1565 22.7233C42.1834 22.7033 43.215 22.5033 42.8381 21.7833Z"
              fill="white"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
function GoalsSummary() {
  return (
    <section className="space-y-5">
      <h2 className="md:text-xl font-semibold text-gray-900">
        Daily & Weekly Goals Summary
      </h2>

      <div className="rounded-[28px] border border-muted/40 bg-white p-8 shadow-lg shadow-gray-200/60 max-md:px-4 max-md:py-6">
        {/* Weekly Goal */}
        <div>
          <h3 className="md:text-xl font-semibold text-gray-900">
            Weekly Goal
          </h3>

          <p className="text-sm text-gray-500">
            Pass 8 practice test this week
          </p>

          {/* Calendar */}
          <WeeklyGoalCalendar />

          {/* Streak */}
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-violet-50 px-4 py-3 text-sm max-md:text-xs font-semibold">
            <Icon
              icon="solar:bolt-bold"
              className="text-violet-600"
              size={18}
            />

            <span>4/7</span>

            <span>Your weekly streak is going strong</span>
          </div>
        </div>

        {/* Daily Goal */}
        <div className="mt-10 flex items-center justify-between">
          <h3 className="md:text-lg font-bold text-gray-900">
            05 Feb | Daily Goal
          </h3>

          <p className="text-lg">
            <span className="font-bold">5</span>
            <span className="text-gray-500 text-xs">/3 practice</span>
          </p>
        </div>

        {/* Achievement */}
        <div className="mt-6 rounded-full bg-[#1d1d1f] py-4 text-center text-sm max-md:text-xs font-medium text-white shadow-lg">
          Congratulations, Daily Goal Achieved!
        </div>

        {/* Activity */}
        <div className="mt-8 overflow-hidden rounded-3xl border border-gray-200">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between border-b border-gray-100 px-3 py-2.5 last:border-b-0"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`h-10 w-[48px] rounded-xl ${activity.colour}`}
                />

                <div>
                  <h4 className="text-sm font-semibold text-gray-900">
                    {activity.title}
                  </h4>

                  <p className="text-xs font-medium text-gray-500">
                    {activity.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Coins size={14} className="text-yellow-400" />
                <span className="font-semibold">{activity.points}</span>
                points
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
function WeeklyGoalCalendar() {
  return (
    <div className="mt-6 overflow-x-auto">
      <div className="flex w-max items-center gap-2">
        {days.map((day) => (
          <button
            key={day.date}
            className={`flex h-10 shrink-0 rounded-xl transition-all ${
              day.status === "completed"
                ? "bg-primary"
                : day.status === "current"
                  ? "bg-primary/10"
                  : "bg-white border-transparent"
            }`}
          >
            <div
              className={`flex w-8 items-center justify-center text-[11px] font-medium ${
                day.status === "completed"
                  ? "text-white"
                  : day.status === "current"
                    ? "text-black"
                    : "text-gray-500"
              }`}
            >
              {day.day}
            </div>

            <div
              className={`flex w-10 items-center justify-center text-sm font-bold m-1 rounded-lg ${
                day.status === "completed"
                  ? "bg-white"
                  : day.status === "current"
                    ? "bg-violet-600 text-white"
                    : "bg-white"
              }`}
            >
              {day.date}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
function MonthlyGoalCardPreview() {
  const current = 4800;
  const target = 10000;
  const percent = Math.round((current / target) * 100);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <h3 className="md:text-lg font-bold text-gray-900">Goal Progress</h3>
        <button
          type="button"
          className="text-sm font-medium text-subtle hover:text-gray-600"
        >
          View History
        </button>
      </div>

      <div className="mt-3 rounded-2xl border border-muted/30 shadow-sm p-6">
        <div className="flex items-center justify-between gap-6">
          <h4 className="md:text-xl font-bold text-gray-900">Monthly Goal</h4>
          <div className="h-1.5 w-48 shrink-0 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{width: `${percent}%`}}
            />
          </div>
        </div>

        <p className="mt-1 text-sm text-subtle">
          Complete 10,000 points in April.
        </p>

        <div className="mt-5 flex items-end justify-between">
          <p className="text-2xl font-bold text-gray-900">
            {current.toLocaleString()}
            <span className="text-sm font-medium text-subtle">
              /{target.toLocaleString()} points
            </span>
          </p>
          <p className="text-sm font-bold text-gray-700">{percent}%</p>
        </div>
      </div>
    </div>
  );
}
type Day = {
  day: string;
  date: string;
  status: "completed" | "failed" | "current" | "upcoming";
};

const days: Day[] = [
  {day: "Su", date: "01", status: "completed"},
  {day: "Mo", date: "02", status: "completed"},
  {day: "Tu", date: "03", status: "completed"},
  {day: "We", date: "04", status: "completed"},
  {day: "Th", date: "05", status: "current"},
  {day: "Fr", date: "06", status: "upcoming"},
  {day: "Sa", date: "07", status: "upcoming"},
];

const activities = [
  {
    id: 1,
    colour: "bg-violet-600",
    title: "Maths: Practice #2",
    date: "05 Apr, 2026 | 8:30 PM",
    points: 99,
  },
  {
    id: 2,
    colour: "bg-orange-500",
    title: "Maths: Practice #2",
    date: "05 Apr, 2026 | 8:30 PM",
    points: 54,
  },
  {
    id: 3,
    colour: "bg-sky-500",
    title: "Maths: Practice #2",
    date: "05 Apr, 2026 | 8:30 PM",
    points: 54,
  },
  {
    id: 4,
    colour: "bg-sky-500",
    title: "Maths: Practice #2",
    date: "05 Apr, 2026 | 8:30 PM",
    points: 54,
  },
  {
    id: 5,
    colour: "bg-sky-500",
    title: "Maths: Practice #2",
    date: "05 Apr, 2026 | 8:30 PM",
    points: 73,
  },
];
