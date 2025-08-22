import { UrlForm } from "@/components/url-form";
import { UrlsTable } from "@/components/urls-table";

export default function Home() {
  return (
    <div>
      <div className="max-w-6xl mx-auto space-y-12">
        <section className="text-center space-y-2">
          <h2 className="text-4xl font-medium tracking-tight">
            Shorten your links. Share them anywhere.
          </h2>
          <p className="text-xl text-foreground/80">
            Turn long, messy URLs into short and easy-to-share links — fast,
            free, and reliable.
          </p>
        </section>
        <section>
          <UrlForm />
        </section>
        <section>
          <UrlsTable />
        </section>
      </div>
    </div>
  );
}
