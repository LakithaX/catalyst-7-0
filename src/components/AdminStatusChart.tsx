type Props = {
  counts: Record<string, number>;
  total: number;
  onSelect: (status: string) => void;
};

const statuses = ['pending', 'approved', 'rejected', 'cancelled'];

export default function AdminStatusChart({ counts, total, onSelect }: Props) {
  return <svg className="admin-chart" viewBox="0 0 600 140" role="group" aria-label="Registration status breakdown. Select a status to view delegates.">
    {[25, 65, 105].map(y => <path key={y} d={`M0 ${y}H600`} stroke="#ffffff16" strokeDasharray="4 7" />)}
    {statuses.map((status, index) => {
      const count = counts[status] || 0;
      const height = Math.max(3, count / Math.max(total, 1) * 95);
      return <g key={status} className="admin-chart-status" role="button" tabIndex={0}
        aria-label={`${count} ${status} registrations. View delegates.`}
        onClick={() => onSelect(status)} onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect(status);
          }
        }}>
        <title>{`${status}: ${count} registrations — click to view`}</title>
        <rect className="admin-chart-hit" x={index * 145 + 10} y="0" width="135" height="140" rx="12" fill="transparent" />
        <rect className="admin-chart-bar" x={45 + index * 145} y={108 - height} width="66" height={height} rx="9"
          style={{ animationDelay: `${index * 45}ms` }} fill={index === 1 ? '#e87861' : '#c8aa83'} />
        <text x={78 + index * 145} y="133" textAnchor="middle" fill="#eadac6" fontSize="11">{status}</text>
      </g>;
    })}
  </svg>;
}
