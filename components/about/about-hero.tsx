export function AboutHero() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              About <span className="text-orange-500">Speak</span>Wise
            </h1>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Transforming the way speakers receive feedback and grow their skills through anonymous, verified insights
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
