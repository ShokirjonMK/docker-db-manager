import {
  Activity,
  Clock3,
  Database,
  Download,
  Loader2,
  Play,
  Plus,
  Search,
  Settings,
  Square,
  Trash2,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react';
import { useAppVersion } from '../../../features/app/hooks/use-app-version';
import { Badge } from '../../../shared/components/ui/badge';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import type { Container } from '../../../shared/types/container';
import type { ContainerStats } from '../hooks/use-container-stats';

interface DatabaseManagerProps {
  containers: Container[];
  stats: ContainerStats;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  hasActiveSearch: boolean;
  loading: boolean;
  onStatusToggle: (containerId: string) => void;
  onDelete: (container: Container) => void;
  onCreateContainer: () => void;
  onEditContainer: (containerId: string) => void;
  disabled?: boolean;
  updateAvailable: boolean;
  checkingUpdate: boolean;
  downloadingUpdate: boolean;
  onCheckForUpdates: () => void;
  dockerAvailable: boolean;
  dockerError?: string;
}

/**
 * Main dashboard view adapted to Digital Univ style.
 */
export function DatabaseManager({
  containers,
  stats,
  searchQuery,
  onSearchChange,
  hasActiveSearch,
  loading,
  onStatusToggle,
  onDelete,
  onCreateContainer,
  onEditContainer,
  disabled = false,
  updateAvailable,
  checkingUpdate,
  downloadingUpdate,
  onCheckForUpdates,
  dockerAvailable,
  dockerError,
}: DatabaseManagerProps) {
  const { version } = useAppVersion();

  const formatter = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'border-green-300 bg-green-50 text-green-700';
      case 'creating':
      case 'removing':
        return 'border-amber-300 bg-amber-50 text-amber-700';
      case 'error':
        return 'border-red-300 bg-red-50 text-red-700';
      default:
        return 'border-slate-300 bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Activity className="h-3 w-3 animate-pulse text-green-600" />;
      case 'creating':
      case 'removing':
        return <Square className="h-3 w-3" />;
      case 'error':
        return <Zap className="h-3 w-3" />;
      default:
        return <Square className="h-3 w-3" />;
    }
  };

  const getDatabaseIcon = (_type: string) => {
    return <Database className="h-5 w-5 text-[#2f6fd7]" />;
  };

  return (
    <div className="student-shell h-full overflow-hidden">
      <div className="student-bg student-bg-one" />
      <div className="student-bg student-bg-two" />

      <div className="relative z-10 flex h-full flex-col">
        <header className="student-topbar border-b border-[#dfe7fb]">
          <div className="mx-auto flex h-full w-full max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3">
              <img
                src="/logo.avif"
                alt="Docker DB Manager"
                className="h-10 w-10 rounded-xl border border-[#d9e4fb] bg-white p-1 shadow-sm"
              />
              <div>
                <h1 className="text-base font-semibold text-[#233f66]">
                  Docker DB Manager
                </h1>
                <p className="text-xs text-[#5f6f86]">v{version}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge
                className={`gap-1 rounded-md border px-2 py-1 text-xs ${
                  dockerAvailable
                    ? 'border-green-300 bg-green-50 text-green-700'
                    : 'border-red-300 bg-red-50 text-red-700'
                }`}
              >
                {dockerAvailable ? (
                  <Wifi className="h-3.5 w-3.5" />
                ) : (
                  <WifiOff className="h-3.5 w-3.5" />
                )}
                {dockerAvailable ? 'Docker online' : 'Docker offline'}
              </Badge>

              {dockerError && !dockerAvailable && (
                <span className="max-w-[280px] truncate text-xs text-[#8c5a5a]">
                  {dockerError}
                </span>
              )}

              <Button
                variant="outline"
                className="gap-2 border-[#c9d7f5] bg-white text-[#365f9f] hover:bg-[#eff4ff]"
                onClick={onCheckForUpdates}
                disabled={disabled || checkingUpdate || downloadingUpdate}
              >
                {checkingUpdate || downloadingUpdate ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {checkingUpdate
                  ? 'Checking...'
                  : downloadingUpdate
                    ? 'Downloading...'
                    : 'Check updates'}
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden p-4">
          <div className="mx-auto flex h-full w-full max-w-[1400px] flex-col gap-4">
            <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <article className="student-card rounded-xl p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[#71829d]">
                  Running
                </p>
                <p className="mt-2 text-2xl font-semibold text-[#1f7a45]">
                  {stats.running}
                </p>
              </article>

              <article className="student-card rounded-xl p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[#71829d]">
                  Stopped
                </p>
                <p className="mt-2 text-2xl font-semibold text-[#5a6f8e]">
                  {stats.stopped}
                </p>
              </article>

              <article className="student-card rounded-xl p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[#71829d]">
                  Errors
                </p>
                <p className="mt-2 text-2xl font-semibold text-[#c03f3f]">
                  {stats.errors}
                </p>
              </article>

              <article className="student-card rounded-xl p-3.5">
                <Button
                  className="h-full w-full gap-2 rounded-lg bg-[#2f6fd7] text-white hover:bg-[#2a61bc]"
                  onClick={onCreateContainer}
                  disabled={disabled}
                >
                  <Plus className="h-4 w-4" />
                  New database
                </Button>
              </article>
            </section>

            <section className="student-panel flex min-h-0 flex-1 flex-col rounded-xl">
              <div className="flex flex-col gap-3 border-b border-[#e6ecfa] p-4 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7d8da7]" />
                  <Input
                    placeholder="Search databases..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="h-10 border-[#ced8ef] bg-white pl-10 text-[#2a3f62] placeholder:text-[#8796b0]"
                    disabled={disabled}
                  />
                </div>
                <div className="text-xs text-[#7f8ea8]">
                  Total: <span className="font-semibold">{stats.total}</span>
                </div>
              </div>

              <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,1fr)_140px_170px_160px] gap-4 border-b border-[#e6ecfa] bg-[#f8fbff] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#7a8aa5] md:grid">
                <span>Database</span>
                <span>Type / Version</span>
                <span>Status</span>
                <span>Host</span>
                <span className="text-right">Actions</span>
              </div>

              <div className="flex-1 overflow-auto">
                {loading ? (
                  <div className="flex h-36 items-center justify-center text-[#607391]">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading databases...
                  </div>
                ) : containers.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                    <Database className="mb-2 h-12 w-12 text-[#9db1d3]" />
                    <p className="text-[#5f7292]">
                      {hasActiveSearch
                        ? 'No databases match search'
                        : 'No databases yet'}
                    </p>
                    {!hasActiveSearch && (
                      <Button
                        variant="outline"
                        className="mt-4 border-[#c8d5f2] bg-white text-[#2f6fd7] hover:bg-[#eff4ff]"
                        onClick={onCreateContainer}
                        disabled={disabled}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create first database
                      </Button>
                    )}
                  </div>
                ) : (
                  containers.map((container) => (
                    <article
                      key={container.id}
                      className="student-row border-b border-[#edf1fb] px-4 py-4"
                    >
                      <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_140px_170px_160px] md:items-center">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="rounded-md border border-[#d7e2f9] bg-[#eef4ff] p-1.5">
                              {getDatabaseIcon(container.dbType)}
                            </div>
                            <h3 className="truncate font-semibold text-[#223a5d]">
                              {container.name}
                            </h3>
                          </div>

                          <div className="mt-2 flex items-center gap-1.5 text-xs text-[#7b8aa4]">
                            <Clock3 className="h-3.5 w-3.5" />
                            {formatter.format(container.createdAt)}
                          </div>
                        </div>

                        <div className="text-sm text-[#4e678c]">
                          <p className="font-medium">{container.dbType}</p>
                          <p className="text-xs text-[#7d8da7]">
                            version {container.version}
                          </p>
                        </div>

                        <Badge
                          className={`w-fit gap-1 rounded-md border px-2 py-1 text-xs font-medium ${getStatusColor(container.status)}`}
                        >
                          {getStatusIcon(container.status)}
                          {container.status}
                        </Badge>

                        <div className="text-sm text-[#516a8f]">
                          localhost:{container.port}
                        </div>

                        <div className="flex justify-end gap-1.5">
                          {container.status === 'running' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 border-[#d4def5] bg-white p-0 text-[#395d92] hover:bg-[#eef4ff]"
                              onClick={() => onStatusToggle(container.id)}
                              disabled={disabled}
                            >
                              <Square className="h-3.5 w-3.5" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="h-8 w-8 bg-[#2f6fd7] p-0 text-white hover:bg-[#295fb9]"
                              onClick={() => onStatusToggle(container.id)}
                              disabled={
                                disabled ||
                                container.status === 'creating' ||
                                container.status === 'removing'
                              }
                            >
                              <Play className="h-3.5 w-3.5" />
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 border-[#d4def5] bg-white p-0 text-[#395d92] hover:bg-[#eef4ff]"
                            onClick={() => onEditContainer(container.id)}
                            disabled={disabled}
                          >
                            <Settings className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 border-red-200 bg-white p-0 text-red-600 hover:bg-red-600 hover:text-white"
                            onClick={() => onDelete(container)}
                            disabled={disabled}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

            {updateAvailable && (
              <div className="pointer-events-none fixed bottom-4 right-4 rounded-full border border-green-300 bg-green-50 px-3 py-1 text-xs font-medium text-green-700 shadow-sm">
                New update available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
