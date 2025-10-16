import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DonationsSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 pt-2">
      <div className="container mx-auto px-4 py-2">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="lg:w-2/3 w-full space-y-4">
              <Skeleton className="h-9 w-60" />
              <Card>
                <CardContent className="p-4 space-y-4">
                  <Skeleton className="h-6 w-44" />
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-32" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-4/5" />
                      <Skeleton className="h-4 w-3/5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-6 w-40" />
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="hidden lg:block lg:w-1/3">
              <Skeleton className="w-full h-80" />
            </div>
          </div>

          <div className="w-full">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-2 mb-6">
                  <Skeleton className="h-7 w-72 mx-auto" />
                  <Skeleton className="h-4 w-64 mx-auto" />
                </div>
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="lg:w-1/2 w-full">
                    <div className="flex justify-center items-end space-x-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <Skeleton className="rounded-full h-20 w-20 mb-2" />
                          <Skeleton className="h-6 w-24" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="lg:w-1/2 w-full space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-3 w-28" />
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <Skeleton className="h-4 w-10 ml-auto" />
                          <Skeleton className="h-3 w-16 ml-auto" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DonationsSkeleton;
