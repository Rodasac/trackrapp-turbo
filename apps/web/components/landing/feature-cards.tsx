import {
  Bell,
  BarChart3,
  Sparkles,
  FileSpreadsheet,
  CalendarDays,
  Moon,
} from "lucide-react";
import { Card, CardContent } from "@repo/ui/card";

const FEATURES = [
  {
    icon: Bell,
    title: "Renewal Reminders",
    description:
      "Get email and push notifications before renewals so you're never caught off guard.",
  },
  {
    icon: BarChart3,
    title: "Spending Analytics",
    description:
      "Visualise where your money goes with trend charts, category breakdowns, and top services.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Tips",
    description:
      "Receive personalised recommendations to cut costs and optimise your subscription stack.",
  },
  {
    icon: FileSpreadsheet,
    title: "CSV Import & Export",
    description:
      "Bring in existing data from spreadsheets and export reports in one click.",
  },
  {
    icon: CalendarDays,
    title: "Calendar View",
    description:
      "See all upcoming renewals at a glance on an interactive monthly calendar.",
  },
  {
    icon: Moon,
    title: "Dark Mode",
    description:
      "A beautiful dark theme that's easy on the eyes, day or night.",
  },
];

export function FeatureCards() {
  return (
    <section id="features" className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg">
            One app to track, analyse, and take control of all your
            subscriptions.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-brand/10 text-brand mb-4 flex size-10 items-center justify-center rounded-full">
                  <Icon className="size-5" />
                </div>
                <h3 className="mb-2 font-semibold">{title}</h3>
                <p className="text-muted-foreground text-sm">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
