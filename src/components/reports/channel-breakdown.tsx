'use client';

import { cn } from '@/lib/utils';

const channelColors = {
  airbnb: '#FF5A5F',
  booking: '#003580',
  vrbo: '#0071C2',
  direct: '#8B5CF6',
};

const channelNames = {
  airbnb: 'Airbnb',
  booking: 'Booking.com',
  vrbo: 'Vrbo',
  direct: 'Direct',
};

export function ChannelBreakdown({
  data,
}: {
  data: { channel: string; revenue: number; bookings: number; percentage: number }[];
}) {
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const totalBookings = data.reduce((sum, d) => sum + d.bookings, 0);

  return (
    <div className="space-y-4">
      {/* Horizontal stacked bar */}
      <div className="h-8 rounded-lg overflow-hidden flex">
        {data.map((item, index) => {
          const color = channelColors[item.channel as keyof typeof channelColors] || '#71717a';
          return (
            <div
              key={index}
              className="group relative transition-all hover:brightness-110"
              style={{
                width: `${item.percentage}%`,
                backgroundColor: color,
              }}
            >
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-zinc-900 border-2 border-zinc-700 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                <div className="text-xs font-semibold text-white">
                  {channelNames[item.channel as keyof typeof channelNames] || item.channel}
                </div>
                <div className="text-xs text-zinc-400 mt-1">
                  ${item.revenue.toLocaleString()} ({item.percentage.toFixed(1)}%)
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">
                  {item.bookings} bookings
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {data.map((item, index) => {
          const color = channelColors[item.channel as keyof typeof channelColors] || '#71717a';
          const name = channelNames[item.channel as keyof typeof channelNames] || item.channel;
          const avgPerBooking = item.bookings > 0 ? item.revenue / item.bookings : 0;

          return (
            <div key={index} className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs font-semibold text-white">{name}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] text-zinc-500">Revenue</span>
                  <span className="text-sm font-bold text-emerald-400">
                    ${item.revenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] text-zinc-500">Bookings</span>
                  <span className="text-xs text-zinc-300">{item.bookings}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] text-zinc-500">Avg/Booking</span>
                  <span className="text-xs text-blue-400">${avgPerBooking.toFixed(0)}</span>
                </div>
                <div className="flex justify-between items-baseline pt-1 border-t border-zinc-800">
                  <span className="text-[10px] text-zinc-500">% of Total</span>
                  <span className="text-xs font-semibold text-white">{item.percentage.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-zinc-900/30 rounded-lg p-4 border border-zinc-800">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-zinc-500 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-white">${totalRevenue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Total Bookings</p>
            <p className="text-2xl font-bold text-white">{totalBookings}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
