import { ArrowDown, ArrowUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
}

const MetricCard = ({ label, value, change, changeLabel }: MetricCardProps) => {
  const isNegative = change !== undefined && change < 0;
  const isPositive = change !== undefined && change > 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1">
              {isNegative && <ArrowDown className="h-4 w-4 text-destructive" />}
              {isPositive && <ArrowUp className="h-4 w-4 text-success" />}
              <span
                className={`text-sm font-medium ${
                  isNegative ? 'text-destructive' : isPositive ? 'text-success' : 'text-muted-foreground'
                }`}
              >
                {change > 0 ? '+' : ''}
                {change}%
              </span>
              {changeLabel && <span className="text-sm text-muted-foreground ml-1">{changeLabel}</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
