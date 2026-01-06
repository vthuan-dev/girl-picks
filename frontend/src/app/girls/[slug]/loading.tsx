import Header from '@/components/layout/Header';

export default function Loading() {
    return (
        <>
            <Header />
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-1 sm:py-6 lg:py-8 animate-pulse">
                {/* Breadcrumbs Skeleton */}
                <div className="h-4 w-48 bg-secondary/20 rounded mb-6"></div>

                <div className="flex flex-col lg:grid lg:grid-cols-[2fr,1fr] gap-4 sm:gap-6 lg:gap-10">
                    {/* Gallery Skeleton */}
                    <div className="space-y-4 sm:space-y-6">
                        <div className="aspect-[4/5] sm:aspect-video w-full bg-secondary/20 rounded-2xl shadow-lg border border-secondary/10"></div>

                        {/* Bio Skeleton */}
                        <div className="space-y-3 p-4 bg-secondary/5 rounded-2xl border border-secondary/10">
                            <div className="h-6 w-32 bg-secondary/20 rounded"></div>
                            <div className="h-4 w-full bg-secondary/20 rounded"></div>
                            <div className="h-4 w-full bg-secondary/20 rounded"></div>
                            <div className="h-4 w-2/3 bg-secondary/20 rounded"></div>
                        </div>
                    </div>

                    {/* Sidebar InfoCard Skeleton */}
                    <div className="space-y-4 sm:space-y-6 lg:sticky lg:top-20 h-fit">
                        <div className="bg-secondary/5 border border-secondary/10 rounded-2xl p-6 space-y-6">
                            <div className="h-8 w-1/2 bg-secondary/20 rounded"></div>
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex justify-between items-center">
                                        <div className="h-4 w-20 bg-secondary/20 rounded"></div>
                                        <div className="h-4 w-32 bg-secondary/20 rounded"></div>
                                    </div>
                                ))}
                            </div>
                            <div className="h-12 w-full bg-primary/20 rounded-xl"></div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section Skeleton */}
                <div className="mt-8 space-y-4 max-w-3xl">
                    <div className="h-8 w-48 bg-secondary/20 rounded"></div>
                    <div className="space-y-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="p-4 bg-secondary/5 rounded-xl border border-secondary/10 space-y-3">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-full bg-secondary/20"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 w-24 bg-secondary/20 rounded"></div>
                                        <div className="h-3 w-16 bg-secondary/20 rounded"></div>
                                    </div>
                                </div>
                                <div className="h-4 w-full bg-secondary/20 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Related Girls Skeleton */}
                <div className="mt-12 space-y-4">
                    <div className="h-8 w-48 bg-secondary/20 rounded"></div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="aspect-[3/4] bg-secondary/20 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
