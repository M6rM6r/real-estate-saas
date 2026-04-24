'use client';

import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Mail, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Clock } from 'lucide-react';

interface Stats {
  totalLeads: number;
  newThisWeek: number;
  conversionRate: number;
  avgResponseTime: string;
  trend?: {
    leadsChange?: number;
    rateChange?: number;
  };
}

interface LeadStatsCardsProps {
  stats: Stats;
}

export function LeadStatsCards({ stats }: LeadStatsCardsProps) {
  const statCards = [
    {
      label: 'إجمالي الاستفسارات',
      value: stats.totalLeads.toString(),
      icon: Mail,
      trend: stats.trend?.leadsChange,
    },
    {
      label: 'جديد هذا الأسبوع',
      value: stats.newThisWeek.toString(),
      icon: AlertCircle,
    },
    {
      label: 'معدل التحويل',
      value: `${stats.conversionRate}%`,
      icon: CheckCircle,
      trend: stats.trend?.rateChange,
    },
    {
      label: 'متوسط وقت الرد',
      value: stats.avgResponseTime,
      icon: Clock,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, idx) => {
        const Icon = card.icon;
        const hasTrend = card.trend !== undefined;
        const isPositive = card.trend && card.trend > 0;

        return (
          <Card key={idx} className="bg-[#1a1a2e] border-gray-700 hover:border-gray-600 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Icon className="h-6 w-6 text-blue-400" />
                </div>
                {hasTrend && card.trend !== undefined && (
                  <div
                    className={`flex items-center gap-1 text-sm font-semibold ${
                      isPositive ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {Math.abs(card.trend)}%
                  </div>
                )}
              </div>
              <p className="text-gray-400 text-sm mb-2">{card.label}</p>
              <p className="text-white text-3xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
