import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function LoadingState({ label }: { label: string }) {
  return (
    <Card>
      <CardContent className="py-10 text-center text-sm text-slate-500">Loading {label.toLowerCase()}...</CardContent>
    </Card>
  );
}

export function EmptyState({ title, description, actionLabel, onAction }: { title: string; description: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <Card>
      <CardContent className="py-10 text-center">
        <h3 className="text-base font-semibold text-slate-950">{title}</h3>
        <p className="mt-2 text-sm text-slate-500">{description}</p>
        {actionLabel && onAction ? (
          <Button className="mt-4" onClick={onAction} type="button">
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Alert className="border-danger/20 bg-danger/5 text-danger">
      <div className="flex items-center justify-between gap-4">
        <span>{message}</span>
        <Button size="sm" variant="outline" onClick={onRetry} type="button">
          Retry
        </Button>
      </div>
    </Alert>
  );
}