/**
 * TypeScript Definitions for Config Studio Plugin SDK
 * Config Studio v2.3.2+
 *
 * Use in your plugin development for autocompletion and type checking:
 * /// <reference path="./types/config-studio.d.ts" />
 */

export type PermissionType =
  | 'fs'
  | 'fs.read'
  | 'fs.write'
  | 'shell.exec'
  | 'terminal.exec'
  | 'remote.exec'
  | 'network'
  | 'network.bind'
  | 'secrets'
  | 'secrets.access'
  | 'contextmenu'
  | 'toolbar'
  | 'ui.panels'
  | `ui.${string}`
  | `service:${string}`
  | `service.${string}`
  | 'service:*'
  | '*';

export interface PluginSettingField {
  id: string;
  label: string;
  description?: string;
  type: 'boolean' | 'string' | 'number' | 'select';
  default?: any;
  options?: Array<{ label: string; value: any }>;
}

export interface PluginAgentBinary {
  path: string;
  sha256?: string;
}

export interface PluginAgentDef {
  version: string;
  commit?: string;
  binaries: {
    'linux-amd64'?: PluginAgentBinary;
    'linux-arm64'?: PluginAgentBinary;
    [arch: string]: PluginAgentBinary | undefined;
  };
}

export interface LanguagePackDef {
  code: string;
  name: string;
  flag?: string;
  translations: Record<string, string>;
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author?: string;
  homepage?: string;
  icon?: string; // Lucide icon name or SVG
  entry: string; // e.g. "main.js"
  css?: string; // e.g. "style.css"
  styles?: string[]; // list of stylesheets to inject
  capabilities?: string[]; // alias for permissions
  permissions?: (PermissionType | string)[];
  fileMatches?: string[];
  dependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  providesServices?: string[];
  settings?: PluginSettingField[];
  locales?: Record<string, Record<string, string>>;
  localization?: LanguagePackDef;
  actionToolbar?: {
    primaryAction?: string;
    targets?: Array<{ id: string; label: string; command?: string }>;
    hotkey?: string;
  };
  agent?: PluginAgentDef;
  minAppVersion?: string;
}

export interface OpenFileOptions {
  line?: number;
  column?: number;
  highlight?: boolean;
}

export interface OpenFile {
  name: string;
  path: string;
  content: string;
  ext?: string;
  isDirty?: boolean;
}

export interface CustomTabDef {
  path: string;
  name: string;
  content: string;
  language?: string;
  readOnly?: boolean;
  badge?: string;
  onSave?: (content: string) => Promise<void>;
}

export interface SplitActionOption {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  isDefault?: boolean;
  onClick?: () => void;
}

export interface ToolbarButtonDef {
  id: string;
  pluginId: string;
  label: string;
  title?: string;
  icon?: string; // Lucide icon name, e.g. 'globe', 'play', 'terminal', 'server'
  shortcut?: string;
  fileMatches?: string[];
  options?: SplitActionOption[];
  activeOptionId?: string;
  onSelectOption?: (optionId: string) => void;
  visible?: (file?: OpenFile | null) => boolean;
  onClick: (selectedOptionId?: string) => void | Promise<void>;
}

export type ContextMenuGroup = 'open' | 'clipboard' | 'tools' | 'edit' | 'danger';

export interface ContextMenuTarget {
  type: 'file' | 'folder' | 'empty' | 'any';
  path?: string;
  name?: string;
  ext?: string;
}

export interface ContextMenuItemDef {
  id: string;
  pluginId?: string;
  label: string;
  icon?: string; // Lucide icon name
  group?: ContextMenuGroup;
  order?: number;
  shortcut?: string;
  fileMatches?: string[]; // e.g. ['.yaml', '.json']
  targetType?: 'file' | 'folder' | 'empty' | 'any';
  onClick: (target: ContextMenuTarget | string, isDir?: boolean) => void | Promise<void>;
  isVisible?: (target: ContextMenuTarget | string, isDir?: boolean) => boolean;
  isEnabled?: (target: ContextMenuTarget | string, isDir?: boolean) => boolean;
}

export interface ContextMenuAPI {
  register(item: ContextMenuItemDef): () => void;
  unregister(id: string): void;
  getItemsForTarget(target: ContextMenuTarget): ContextMenuItemDef[];
}

export interface SplitPanelDef {
  id: string;
  pluginId: string;
  title: string;
  open: boolean;
  render: (container: HTMLElement) => void;
}

export interface BottomPanelDef {
  id: string;
  pluginId: string;
  title: string;
  icon?: string;
  badge?: string | number;
  open: boolean;
  render: (container: HTMLElement) => void;
  onShow?: () => void;
  onHide?: () => void;
  onResize?: (width: number, height: number) => void;
}

export interface HeaderItemDef {
  id: string;
  pluginId: string;
  order?: number;
  render: (container: HTMLElement) => void;
}

export interface OutlineNode {
  id?: string;
  name?: string;
  label?: string;
  kind?: 'object' | 'list' | 'string' | 'number' | 'boolean' | 'section' | 'function' | 'class' | string;
  type?: 'object' | 'list' | 'string' | 'number' | 'boolean' | 'section' | 'function' | 'class' | string;
  line?: number;
  column?: number;
  value?: string;
  children?: OutlineNode[];
}

export interface OutlineProvider {
  language: string; // e.g. 'html', 'php', 'rust', 'go', 'nginx', 'conf'
  parse: (content: string, filename: string) => OutlineNode[];
}

export interface ExecRequest {
  pluginId: string;
  command: string;
  args?: string[];
  cwd?: string;
}

export interface ExecResponse {
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
  requiresConfirm?: boolean;
  warning?: string;
  error?: string;
}

export interface ProcessInfo {
  id: string;
  pluginId: string;
  command: string;
  args: string[];
  pid: number;
  port?: number;
  startedAt: string;
  status: 'running' | 'stopped' | 'failed';
}

export interface StartProcessRequest {
  pluginId: string;
  command: string;
  args?: string[];
  cwd?: string;
  port?: number;
}

export interface InterPluginServicesAPI {
  /**
   * Register an inter-plugin service provider.
   * Requires plugin to declare service name in manifest `providesServices`.
   */
  register(serviceName: string, implementation: any, providerPluginId: string): void;

  /**
   * Access a service provided by another plugin.
   * Requires plugin to declare dependency in `dependencies` or `optionalDependencies` and permission `service:<name>`.
   * Throws an error if service is not registered.
   */
  get<T = any>(serviceName: string, consumerPluginId: string): Promise<T>;

  /**
   * Safely retrieve a service if it is active, or null if the optional plugin is not installed/disabled.
   * Does not throw if service is missing or uninstalled.
   * Available in Config Studio v2.0.0+.
   */
  getOptional<T = any>(serviceName: string, consumerPluginId: string): Promise<T | null>;

  /**
   * Check if a service is registered and active in the service bus.
   */
  has(serviceName: string): boolean;

  /**
   * List all registered active service names.
   */
  list(): string[];
}

export type SecretCategory =
  | 'agent_credentials'
  | 'password'
  | 'ssh_key'
  | 'token'
  | 'certificate'
  | 'env'
  | 'shared'
  | 'other';

export interface SecretItem {
  id: string;
  label: string;
  category?: SecretCategory;
  value?: string;
  updatedAt?: string;
}

export interface SecretsStatus {
  backend: string;
  isAvailable: boolean;
  count: number;
  authEnabled: boolean;
  privilegedActive: boolean;
}

export interface SecretsAPI {
  /**
   * Retrieve a secret value by key from the secure OS Keychain / Vault.
   * Requires 'secrets' or 'secrets.access' permission.
   */
  get(id: string, scope?: string): Promise<string | null>;

  /**
   * Save or update a secret in Core Vault.
   */
  set(item: SecretItem): Promise<void>;

  /**
   * Delete a secret by id.
   */
  delete(id: string): Promise<void>;

  /**
   * List names of shared fleet secrets available for plugins.
   */
  listShared(): Promise<string[]>;

  /**
   * List secret metadata items filtered optionally by category.
   */
  list(category?: SecretCategory | string): Promise<SecretItem[]>;

  /**
   * Get Core Vault status.
   */
  getStatus(): Promise<SecretsStatus>;

  /**
   * Unlock secrets storage with password.
   */
  unlock(password: string): Promise<boolean>;
}

export interface I18nAPI {
  /**
   * Translate a key using current application locale with optional parameters.
   */
  t(pluginId: string, key: string, fallback?: string, params?: Record<string, any>): string;

  /**
   * Create a scoped translator helper for a specific plugin.
   */
  scoped(pluginId: string): {
    (key: string, fallback?: string, params?: Record<string, any>): string;
    t: (key: string, fallback?: string, params?: Record<string, any>) => string;
    getLanguage: () => string;
    onLanguageChange: (callback: (lang: string) => void) => () => void;
  };

  /**
   * Get current active language code ('ru', 'en', etc.).
   */
  getLanguage(): string;

  /**
   * Subscribe to language change events.
   */
  onLanguageChange(callback: (lang: string) => void): () => void;

  /**
   * Register translation dictionaries for a plugin.
   */
  registerLocales(pluginId: string, locales: Record<string, Record<string, string>>): void;

  /**
   * Register a full core UI language pack.
   */
  registerLanguagePack(pack: LanguagePackDef): void;
}

export interface SysInfoData {
  hostId: string;
  hostName: string;
  os: string;
  platform: string;
  arch: string;
  uptimeSeconds: number;
  cpu: {
    cores: number;
    usagePercent: number;
    model?: string;
  };
  memory: {
    totalBytes: number;
    usedBytes: number;
    freeBytes: number;
    usedPercent: number;
  };
  disks: Array<{
    mountPoint: string;
    totalBytes: number;
    freeBytes: number;
    usedBytes: number;
    usedPercent: number;
  }>;
  collectedAt: string;
}

export interface SysInfoState {
  activeNodeId: string;
  activeNodeName: string;
  metrics: SysInfoData | null;
  history: SysInfoData[];
  error: string | null;
  loading: boolean;
  lastUpdated: number;
}

export interface SysInfoAPI {
  get(serverId?: string): SysInfoData | null;
  getState(): SysInfoState;
  refresh(): Promise<SysInfoData>;
  setActiveNode(id: string, name: string): void;
  subscribe(callback: (state: SysInfoState) => void): () => void;
  formatBytes(bytes: number, decimals?: number): string;
  formatUptime(seconds: number): string;
}

export interface TelemetryAPI {
  captureError(err: Error, context?: Record<string, any>): void;
  log(action: string, details?: Record<string, any>, severity?: 'info' | 'warn' | 'critical'): void;
}

export interface SSHHost {
  id: string;
  name: string;
  host: string;
  port: number;
  user: string;
  authType: 'password' | 'private_key' | 'vault';
  identityId?: string;
  password?: string;
  privateKey?: string;
  passphrase?: string;
  jumpHostId?: string;
  defaultPath?: string;
  tags?: string[];
  createdAt?: string;
}

export interface SSHHostService {
  list(): SSHHost[];
  get(id: string): SSHHost | undefined;
  save(host: SSHHost): Promise<void>;
  delete(id: string): Promise<void>;
  fetchFromServer(): Promise<SSHHost[]>;
  reload(): Promise<SSHHost[]>;
  getLastActiveHostId(): string | null;
  setLastActiveHostId(id: string): void;
  getLastSftpPath(hostId: string): string;
  setLastSftpPath(hostId: string, path: string): void;
  subscribe(listener: (hosts: SSHHost[]) => void): () => void;
  exportOpenSSH(): Promise<string>;
  importOpenSSH(content: string): Promise<any>;
  exportPortableSecrets(passphrase: string): Promise<Blob>;
  importPortableSecrets(file: Blob, passphrase: string): Promise<any>;
}

export interface VanillaDropdownOption {
  value: string | number;
  label: string;
  icon?: string;
  badge?: string;
  badgeVariant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  statusDot?: 'online' | 'offline' | 'warn';
  secondaryText?: string;
  disabled?: boolean;
}

export interface VanillaDropdownConfig {
  options: VanillaDropdownOption[];
  value?: string | number | null;
  onChange?: (val: any, opt?: VanillaDropdownOption) => void;
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  label?: string;
  description?: string;
  error?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
  menuClassName?: string;
  clearable?: boolean;
  accentColor?: string;
}

export interface VanillaDropdownController {
  getValue: () => string | number | null | undefined;
  setValue: (value: string | number | null) => void;
  setOptions: (options: VanillaDropdownOption[]) => void;
  setError: (error: string | undefined) => void;
  setDisabled: (disabled: boolean) => void;
  destroy: () => void;
}

export interface UIAPI {
  toast(message: string, type?: 'info' | 'success' | 'error' | 'warning', title?: string): void;
  renderDropdown(container: HTMLElement, config: VanillaDropdownConfig): VanillaDropdownController;
}

export interface ConfigStudioAPI {
  // UI Panels & Customization
  registerToolbarButton(btn: ToolbarButtonDef): void;
  registerContextMenu(item: ContextMenuItemDef): () => void;
  contextMenu: ContextMenuAPI;
  registerSplitPanel(panel: SplitPanelDef): void;
  toggleSplitPanel(panelDef: Partial<SplitPanelDef> & { id: string }): void;
  registerBottomPanel(panel: BottomPanelDef): void;
  toggleBottomPanel(panelDef: Partial<BottomPanelDef> & { id: string }): void;
  registerHeaderItem(item: HeaderItemDef): void;

  // Editor & Document Access
  getActiveFile(): OpenFile | null;
  getActiveContent(): string;
  setActiveContent(content: string): void;
  openFile(path: string, options?: OpenFileOptions): Promise<void>;
  createFile(path: string, content?: string): Promise<void>;
  refreshFiles(): Promise<void>;
  openCustomTab(tab: CustomTabDef): Promise<void>;

  // Native SSH / SFTP Integration
  openTerminal(host?: SSHHost | any): void;
  openSftp(host?: SSHHost | any): void;
  ssh: SSHHostService;

  // Monaco Editor & Language Extensions
  getMonaco(): any;
  getEditor(): any;
  registerCompletionProvider(language: string, provider: any): any;
  registerOutlineProvider(provider: OutlineProvider): void;

  // Host Commands & Background Processes
  exec(req: ExecRequest): Promise<ExecResponse>;
  startProcess(req: StartProcessRequest): Promise<ProcessInfo>;
  stopProcess(processId: string): Promise<void>;

  // Inter-Plugin RPC & Services
  services: InterPluginServicesAPI;

  // Secure OS Keychain & Secrets Vault
  secrets: SecretsAPI;

  // Localization & Translations
  i18n: I18nAPI;
  getLanguage(): string;

  // Hardware Telemetry & Monitoring (Core v2.1+)
  sysinfo: SysInfoAPI;

  // Observability & Telemetry
  telemetry: TelemetryAPI;

  // Plugin Settings & Configuration
  registerPluginSettings(pluginId: string, def: { render: (container: HTMLElement) => void } | ((container: HTMLElement) => void)): void;
  getPluginSettings(pluginId: string): Promise<Record<string, any>>;
  savePluginSettings(pluginId: string, settings: Record<string, any>): Promise<void>;

  // UI & Design System (@config-studio/ui)
  ui: UIAPI;

  // System & Helpers
  showNotification(message: string, type?: 'info' | 'success' | 'error'): void;
  showToast(message: string, type?: 'info' | 'success' | 'error'): void;
  setRemoteEndpoint(url: string | null, token?: string): void;
  onFileOpen(callback: (file: OpenFile) => void): void;
  onFileSave(callback: (file: OpenFile) => void): void;
}

declare global {
  interface Window {
    ConfigStudio?: ConfigStudioAPI;
  }
}
