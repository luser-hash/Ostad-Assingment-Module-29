import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Panel({ title, children, right }) {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 pb-4">
        <CardTitle className="text-base">{title}</CardTitle>
        {right}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
