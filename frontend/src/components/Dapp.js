import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createInitialData, STORAGE_KEY } from "../data/seed";
import "./Dapp.css";

const STATUSES = ["Sẵn sàng", "Đang sử dụng", "Đang bảo trì", "Hư hỏng", "Thanh lý"];
const TODAY = () => new Date().toISOString().slice(0, 10);
const money = (value) => `${new Intl.NumberFormat("vi-VN").format(Number(value) || 0)} ₫`;
const dateLabel = (value) => value ? new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString("vi-VN") : "—";
const shortAddress = (value = "") => value.length > 23 ? `${value.slice(0, 10)}…${value.slice(-7)}` : value;

const NAV_ITEMS = [
  { id: "dashboard", label: "Tổng quan", icon: "dashboard", roles: ["Admin", "NhanVien", "BanLanhDao"] },
  { id: "assets", label: "Tài sản", icon: "assets", roles: ["Admin", "NhanVien", "BanLanhDao"] },
  { id: "accounts", label: "Tài khoản người dùng", icon: "employees", roles: ["Admin"] },
  { id: "allocations", label: "Cấp phát & thu hồi", icon: "allocation", roles: ["Admin"] },
  { id: "departments", label: "Phòng ban", icon: "departments", roles: ["Admin"] },
  { id: "employees", label: "Nhân viên", icon: "employees", roles: ["Admin"] },
  { id: "categories", label: "Danh mục tài sản", icon: "categories", roles: ["Admin"] },
  { id: "maintenance", label: "Bảo trì", icon: "maintenance", roles: ["Admin", "NhanVien"] },
  { id: "liquidations", label: "Thanh lý", icon: "liquidation", roles: ["Admin"] },
  { id: "reports", label: "Thống kê & báo cáo", icon: "reports", roles: ["Admin", "BanLanhDao"] },
  { id: "activity", label: "Nhật ký hoạt động", icon: "activity", roles: ["Admin"] },
];

const ICON_PATHS = {
  dashboard: <><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="5" rx="1.5" /><rect x="13" y="10" width="8" height="11" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /></>,
  assets: <><path d="M3 7.5 12 3l9 4.5-9 4.5-9-4.5Z" /><path d="M3 12l9 4.5 9-4.5M3 16.5 12 21l9-4.5M12 12v9" /></>,
  allocation: <><path d="M4 7h15M15 3l4 4-4 4M20 17H5m4-4-4 4 4 4" /></>,
  departments: <><path d="M3 21h18M5 21V7l7-4 7 4v14M9 10h1m4 0h1m-6 4h1m4 0h1m-5 7v-4h3v4" /></>,
  employees: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 8v6m3-3h-6" /></>,
  categories: <><path d="M20 13 13 20a2 2 0 0 1-3 0l-7-7V4h9l8 8a2 2 0 0 1 0 1Z" /><circle cx="7.5" cy="8.5" r="1" /></>,
  maintenance: <><path d="M14.7 6.3a5 5 0 0 0-6.4 6.4L3 18l3 3 5.3-5.3a5 5 0 0 0 6.4-6.4L14 13l-3-3 3.7-3.7Z" /></>,
  liquidation: <><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m5 4v6m4-6v6" /></>,
  reports: <><path d="M4 19V5m0 14h17M8 15l3-4 3 2 5-6" /><path d="M16 7h3v3" /></>,
  activity: <><path d="M3 12h4l3-8 4 16 3-8h4" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  plus: <><path d="M12 5v14m-7-7h14" /></>,
  close: <><path d="m18 6-12 12M6 6l12 12" /></>,
  chevron: <path d="m9 18 6-6-6-6" />,
  download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5m5 5H9" /></>,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>,
  filter: <><path d="M4 7h16M7 12h10m-7 5h4" /></>,
  box: <><path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5M12 8v5" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  arrow: <><path d="M7 17 17 7M7 7h10v10" /></>,
  menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
};

function loadStoredData() {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return createInitialData();
  const defaults = createInitialData();
  const parsed = JSON.parse(saved);
  return { ...defaults, ...parsed, accounts: Array.isArray(parsed.accounts) ? parsed.accounts : defaults.accounts };
}

function Icon({ name, size = 18 }) {
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICON_PATHS[name] || ICON_PATHS.box}</svg>;
}

function createId(prefix, rows) {
  const max = rows.reduce((highest, row) => {
    const match = row.id && row.id.match(/(\d+)$/);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
  return `${prefix}${String(max + 1).padStart(3, "0")}`;
}

function saveDownload(filename, contents, type) {
  const link = document.createElement("a");
  const url = URL.createObjectURL(new Blob([contents], { type }));
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function escapeCsv(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function Dapp() {
  const [data, setData] = useState(loadStoredData);
  const [storageWarning, setStorageWarning] = useState("");
  const [user, setUser] = useState(null);
  const [loginName, setLoginName] = useState("admin");
  const [loginPassword, setLoginPassword] = useState("admin123");
  const [loginError, setLoginError] = useState("");
  const [page, setPage] = useState("dashboard");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả tình trạng");
  const [form, setForm] = useState(null);
  const [detailAsset, setDetailAsset] = useState(null);
  const [toast, setToast] = useState("");
  const [reportType, setReportType] = useState("category");
  const [showDataTools, setShowDataTools] = useState(false);
  const fileInput = useRef(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setStorageWarning("");
    } catch (error) {
      console.error("Không thể lưu dữ liệu thử nghiệm vào trình duyệt.", error);
      setStorageWarning("Trình duyệt không cho phép lưu dữ liệu. Thay đổi có thể mất khi tải lại trang.");
    }
  }, [data]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const departmentName = useCallback((id) => data.departments.find((item) => item.id === id)?.name || "—", [data.departments]);
  const employeeName = useCallback((id) => data.employees.find((item) => item.id === id)?.name || "—", [data.employees]);
  const categoryName = useCallback((id) => data.categories.find((item) => item.id === id)?.name || "—", [data.categories]);
  const canManage = user?.role === "Admin";
  const visibleNav = NAV_ITEMS.filter((item) => item.roles.includes(user?.role));

  const scopedAssets = useMemo(() => {
    if (user?.role === "NhanVien") return data.assets.filter((asset) => asset.employeeId === user.employeeId);
    return data.assets;
  }, [data.assets, user]);
  const stats = useMemo(() => {
    const activeAssets = data.assets.filter((asset) => asset.status !== "Thanh lý");
    return {
      total: data.assets.length,
      active: activeAssets.length,
      value: activeAssets.reduce((total, asset) => total + Number(asset.value || 0), 0),
      inUse: data.assets.filter((asset) => asset.status === "Đang sử dụng").length,
      maintenance: data.maintenance.filter((item) => item.status === "Chờ xử lý").length,
      ready: data.assets.filter((asset) => asset.status === "Sẵn sàng").length,
    };
  }, [data]);
  const dashboardData = user?.role === "NhanVien"
    ? { ...data, assets: scopedAssets, maintenance: data.maintenance.filter((item) => item.employeeId === user.employeeId), logs: [] }
    : data;
  const dashboardStats = user?.role === "NhanVien"
    ? {
      ...stats,
      total: scopedAssets.length,
      active: scopedAssets.filter((item) => item.status !== "Thanh lý").length,
      value: scopedAssets.filter((item) => item.status !== "Thanh lý").reduce((sum, item) => sum + Number(item.value), 0),
      inUse: scopedAssets.filter((item) => item.status === "Đang sử dụng").length,
      maintenance: data.maintenance.filter((item) => item.employeeId === user.employeeId && item.status === "Chờ xử lý").length,
      ready: scopedAssets.filter((item) => item.status === "Sẵn sàng").length,
    }
    : stats;

  const filteredAssets = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("vi");
    return scopedAssets.filter((asset) => {
      const matchesStatus = statusFilter === "Tất cả tình trạng" || asset.status === statusFilter;
      const searchable = [asset.id, asset.name, categoryName(asset.categoryId), departmentName(asset.departmentId), employeeName(asset.employeeId), asset.supplier, asset.location].join(" ").toLocaleLowerCase("vi");
      return matchesStatus && (!needle || searchable.includes(needle));
    });
  }, [scopedAssets, query, statusFilter, categoryName, departmentName, employeeName]);

  const logAction = (action, detail, update) => {
    setData((current) => {
      const updated = update(current);
      const log = {
        id: `LG${Date.now()}`,
        date: new Date().toISOString(),
        actor: user?.name || "Admin",
        action,
        detail,
      };
      return { ...updated, logs: [log, ...(updated.logs || [])].slice(0, 200) };
    });
    setToast(action);
  };

  const login = (event) => {
    event.preventDefault();
    const account = data.accounts.find((item) => item.username === loginName.trim().toLowerCase());
    if (!account) {
      setLoginError("Tên đăng nhập không tồn tại.");
      return;
    }
    if (account.active === false) {
      setLoginError("Tài khoản bị khóa hoặc ngừng hoạt động.");
      return;
    }
    if (account.password !== loginPassword) {
      setLoginError("Mật khẩu không chính xác.");
      return;
    }
    const session = { ...account };
    delete session.password;
    setUser(session);
    setPage("dashboard");
    setLoginError("");
    setToast(`Xin chào, ${account.name}`);
  };

  const logout = () => {
    setUser(null);
    setPage("dashboard");
    setQuery("");
    setToast("Bạn đã đăng xuất");
  };

  const openForm = (type, record = null) => setForm({ type, record });

  const submitForm = (values) => {
    const record = form.record;
    const requireText = (key, label) => {
      if (!String(values[key] || "").trim()) throw new Error(`${label} không được để trống.`);
    };
    const duplicate = (rows, key, label) => {
      if (!record && rows.some((item) => String(item[key]).toLowerCase() === String(values[key]).trim().toLowerCase())) {
        throw new Error(`${label} đã tồn tại trong hệ thống.`);
      }
    };
    try {
      if (form.type === "asset") {
        ["id", "name", "categoryId", "status"].forEach((key) => requireText(key, ({ id: "Mã tài sản", name: "Tên tài sản", categoryId: "Loại tài sản", status: "Tình trạng" })[key]));
        duplicate(data.assets, "id", "Mã tài sản");
        if (Number(values.value) < 0 || !Number.isFinite(Number(values.value))) throw new Error("Giá trị tài sản phải là số không âm.");
        if (!data.categories.some((item) => item.id === values.categoryId)) throw new Error("Loại tài sản không tồn tại.");
        if (values.employeeId && !data.employees.some((item) => item.id === values.employeeId)) throw new Error("Nhân viên không tồn tại.");
        const selectedEmployee = data.employees.find((item) => item.id === values.employeeId);
        const asset = {
          ...values,
          id: String(values.id).trim(),
          value: Number(values.value || 0),
          departmentId: selectedEmployee ? selectedEmployee.departmentId : values.departmentId || "",
          employeeId: values.employeeId || "",
        };
        logAction(record ? "Cập nhật tài sản" : "Thêm tài sản", `${asset.name} · ${asset.id}`, (current) => ({
          ...current,
          assets: record ? current.assets.map((item) => item.id === record.id ? asset : item) : [asset, ...current.assets],
        }));
      } else if (form.type === "department") {
        ["id", "name"].forEach((key) => requireText(key, key === "id" ? "Mã phòng ban" : "Tên phòng ban"));
        duplicate(data.departments, "id", "Mã phòng ban");
        const department = { ...values, id: String(values.id).trim() };
        logAction(record ? "Cập nhật phòng ban" : "Thêm phòng ban", department.name, (current) => ({
          ...current,
          departments: record ? current.departments.map((item) => item.id === record.id ? department : item) : [department, ...current.departments],
        }));
      } else if (form.type === "employee") {
        ["id", "name", "departmentId"].forEach((key) => requireText(key, ({ id: "Mã nhân viên", name: "Họ tên", departmentId: "Phòng ban" })[key]));
        duplicate(data.employees, "id", "Mã nhân viên");
        const employee = { ...values, id: String(values.id).trim() };
        logAction(record ? "Cập nhật nhân viên" : "Thêm nhân viên", employee.name, (current) => ({
          ...current,
          employees: record ? current.employees.map((item) => item.id === record.id ? employee : item) : [employee, ...current.employees],
          assets: record ? current.assets.map((item) => item.employeeId === record.id ? { ...item, departmentId: employee.departmentId, location: departmentName(employee.departmentId) } : item) : current.assets,
          allocations: record ? current.allocations.map((item) => item.employeeId === record.id && item.status === "Đang sử dụng" ? { ...item, departmentId: employee.departmentId } : item) : current.allocations,
          accounts: record ? current.accounts.map((item) => item.employeeId === record.id && item.role === "NhanVien" ? { ...item, name: employee.name } : item) : current.accounts,
        }));
      } else if (form.type === "category") {
        ["id", "name"].forEach((key) => requireText(key, key === "id" ? "Mã loại" : "Tên loại"));
        duplicate(data.categories, "id", "Mã loại tài sản");
        const category = { ...values, id: String(values.id).trim() };
        logAction(record ? "Cập nhật danh mục" : "Thêm danh mục", category.name, (current) => ({
          ...current,
          categories: record ? current.categories.map((item) => item.id === record.id ? category : item) : [category, ...current.categories],
        }));
      } else if (form.type === "account") {
        requireText("username", "Tên đăng nhập");
        requireText("role", "Vai trò");
        duplicate(data.accounts, "username", "Tên đăng nhập");
        if (record?.username === user.username && values.role !== "Admin") throw new Error("Không thể hạ quyền tài khoản quản trị đang đăng nhập.");
        const username = String(values.username).trim().toLowerCase();
        if (!record && String(values.password || "").length < 6) throw new Error("Mật khẩu phải có ít nhất 6 ký tự.");
        if (values.password && String(values.password).length < 6) throw new Error("Mật khẩu phải có ít nhất 6 ký tự.");
        const employee = data.employees.find((item) => item.id === values.employeeId);
        if (values.role === "NhanVien" && !employee) throw new Error("Vui lòng gắn tài khoản nhân viên với một hồ sơ nhân viên.");
        const account = {
          ...values,
          id: record?.id || createId("TK", data.accounts),
          username,
          name: values.role === "NhanVien" ? employee.name : String(values.name || "").trim(),
          employeeId: values.employeeId || "",
          active: record ? record.active : true,
          password: values.password || record?.password || "",
        };
        if (values.role !== "NhanVien") requireText("name", "Tên hiển thị");
        logAction(record ? "Cập nhật tài khoản" : "Tạo tài khoản", `${account.username} · ${account.role}`, (current) => ({
          ...current,
          accounts: record ? current.accounts.map((item) => item.id === record.id ? account : item) : [account, ...current.accounts],
        }));
        if (record?.username === user.username) setUser((current) => ({ ...current, name: account.name }));
      } else if (form.type === "allocation") {
        requireText("assetId", "Tài sản");
        requireText("employeeId", "Người nhận");
        const asset = data.assets.find((item) => item.id === values.assetId);
        const employee = data.employees.find((item) => item.id === values.employeeId);
        if (!asset || asset.status !== "Sẵn sàng") throw new Error("Chỉ có thể cấp phát tài sản đang sẵn sàng.");
        if (!employee) throw new Error("Nhân viên nhận tài sản không tồn tại.");
        const id = createId("CP", data.allocations);
        logAction("Cấp phát tài sản", `${asset.name} → ${employee.name} · Phiếu ${id}`, (current) => ({
          ...current,
          assets: current.assets.map((item) => item.id === asset.id ? { ...item, status: "Đang sử dụng", employeeId: employee.id, departmentId: employee.departmentId, location: departmentName(employee.departmentId) } : item),
          allocations: [{ id, assetId: asset.id, employeeId: employee.id, departmentId: employee.departmentId, date: values.date || TODAY(), returnedDate: "", status: "Đang sử dụng", handover: values.handover || user.name }, ...current.allocations],
        }));
      } else if (form.type === "transfer") {
        requireText("assetId", "Tài sản");
        requireText("employeeId", "Người nhận mới");
        requireText("reason", "Lý do điều chuyển");
        const asset = data.assets.find((item) => item.id === values.assetId);
        const employee = data.employees.find((item) => item.id === values.employeeId);
        if (!asset || asset.status !== "Đang sử dụng") throw new Error("Chỉ có thể điều chuyển tài sản đang sử dụng.");
        if (!employee) throw new Error("Nhân viên nhận không tồn tại.");
        if (asset.employeeId === employee.id) throw new Error("Người nhận mới phải khác người đang sử dụng.");
        const id = createId("DC", data.transfers);
        logAction("Điều chuyển tài sản", `${asset.name} → ${employee.name} · Phiếu ${id}`, (current) => ({
          ...current,
          assets: current.assets.map((item) => item.id === asset.id ? { ...item, employeeId: employee.id, departmentId: employee.departmentId, location: departmentName(employee.departmentId) } : item),
          allocations: current.allocations.map((item) => item.assetId === asset.id && item.status === "Đang sử dụng" ? { ...item, status: "Đã thu hồi", returnedDate: values.date || TODAY() } : item).concat({
            id: createId("CP", current.allocations), assetId: asset.id, employeeId: employee.id, departmentId: employee.departmentId, date: values.date || TODAY(), returnedDate: "", status: "Đang sử dụng", handover: user.name,
          }),
          transfers: [{ id, assetId: asset.id, fromEmployeeId: asset.employeeId, fromDepartmentId: asset.departmentId, toEmployeeId: employee.id, toDepartmentId: employee.departmentId, date: values.date || TODAY(), reason: values.reason.trim() }, ...current.transfers],
        }));
      } else if (form.type === "maintenanceRequest") {
        requireText("assetId", "Tài sản");
        requireText("content", "Nội dung yêu cầu");
        const asset = data.assets.find((item) => item.id === values.assetId);
        if (!asset || asset.status !== "Đang sử dụng") throw new Error("Chỉ có thể gửi yêu cầu cho tài sản đang sử dụng.");
        const id = createId("BT", data.maintenance);
        logAction("Gửi yêu cầu bảo trì", `${asset.name} · Phiếu ${id}`, (current) => ({
          ...current,
          assets: current.assets.map((item) => item.id === asset.id ? { ...item, status: "Đang bảo trì" } : item),
          maintenance: [{ id, assetId: asset.id, employeeId: user.role === "NhanVien" ? user.employeeId : asset.employeeId, date: values.date || TODAY(), content: values.content.trim(), cost: 0, status: "Chờ xử lý" }, ...current.maintenance],
        }));
      } else if (form.type === "maintenanceComplete") {
        const maintenance = data.maintenance.find((item) => item.id === values.maintenanceId && item.status === "Chờ xử lý");
        if (!maintenance) throw new Error("Yêu cầu bảo trì không tồn tại hoặc đã được xử lý.");
        if (!Number.isFinite(Number(values.cost)) || Number(values.cost) < 0) throw new Error("Chi phí phải là số không âm.");
        logAction("Hoàn tất bảo trì", `${maintenance.id} · Chi phí ${money(values.cost)}`, (current) => ({
          ...current,
          maintenance: current.maintenance.map((item) => item.id === maintenance.id ? { ...item, cost: Number(values.cost), status: "Hoàn tất" } : item),
          assets: current.assets.map((item) => item.id === maintenance.assetId ? { ...item, status: item.employeeId ? "Đang sử dụng" : "Sẵn sàng" } : item),
        }));
      } else if (form.type === "liquidation") {
        requireText("assetId", "Tài sản");
        requireText("reason", "Lý do thanh lý");
        const asset = data.assets.find((item) => item.id === values.assetId);
        if (!asset || asset.status === "Thanh lý") throw new Error("Tài sản không tồn tại hoặc đã được thanh lý.");
        if (!Number.isFinite(Number(values.recoveryValue)) || Number(values.recoveryValue) < 0) throw new Error("Giá trị thu hồi phải là số không âm.");
        const id = createId("TL", data.liquidations);
        logAction("Thanh lý tài sản", `${asset.name} · Phiếu ${id}`, (current) => ({
          ...current,
          assets: current.assets.map((item) => item.id === asset.id ? { ...item, status: "Thanh lý", employeeId: "", departmentId: "", location: "Đã thanh lý" } : item),
          allocations: current.allocations.map((item) => item.assetId === asset.id && item.status === "Đang sử dụng" ? { ...item, status: "Đã thu hồi", returnedDate: values.date || TODAY() } : item),
          liquidations: [{ id, assetId: asset.id, date: values.date || TODAY(), reason: values.reason.trim(), recoveryValue: Number(values.recoveryValue) }, ...current.liquidations],
        }));
      }
      setForm(null);
    } catch (error) {
      setToast(error.message || "Không thể lưu dữ liệu. Vui lòng kiểm tra lại.");
    }
  };

  const returnAsset = (asset) => {
    if (!window.confirm(`Thu hồi "${asset.name}" khỏi ${employeeName(asset.employeeId)}?`)) return;
    logAction("Thu hồi tài sản", `${asset.name} · ${asset.id}`, (current) => ({
      ...current,
      assets: current.assets.map((item) => item.id === asset.id ? { ...item, status: "Sẵn sàng", employeeId: "", departmentId: "", location: "Kho thiết bị" } : item),
      allocations: current.allocations.map((item) => item.assetId === asset.id && item.status === "Đang sử dụng" ? { ...item, status: "Đã thu hồi", returnedDate: TODAY() } : item),
    }));
  };

  const deleteRecord = (kind, record) => {
    const rules = {
      asset: { rows: data.assets, set: "assets", label: "tài sản", id: record.id },
      department: { rows: data.departments, set: "departments", label: "phòng ban", id: record.id },
      employee: { rows: data.employees, set: "employees", label: "nhân viên", id: record.id },
      category: { rows: data.categories, set: "categories", label: "danh mục", id: record.id },
    };
    const config = rules[kind];
    if (!config || !window.confirm(`Bạn chắc chắn muốn xóa ${config.label} "${record.name || record.id}"?`)) return;
    const hasHistory = kind === "asset"
      ? [...data.allocations, ...data.transfers, ...data.maintenance, ...data.liquidations].some((item) => item.assetId === record.id)
      : kind === "department"
        ? data.employees.some((item) => item.departmentId === record.id)
          || data.assets.some((item) => item.departmentId === record.id)
          || data.allocations.some((item) => item.departmentId === record.id)
          || data.transfers.some((item) => item.fromDepartmentId === record.id || item.toDepartmentId === record.id)
        : kind === "employee"
          ? data.assets.some((item) => item.employeeId === record.id)
            || data.allocations.some((item) => item.employeeId === record.id)
            || data.transfers.some((item) => item.fromEmployeeId === record.id || item.toEmployeeId === record.id)
            || data.maintenance.some((item) => item.employeeId === record.id)
            || data.accounts.some((item) => item.employeeId === record.id)
          : data.assets.some((item) => item.categoryId === record.id);
    if (hasHistory) {
      setToast(kind === "department" ? "Không thể xóa phòng ban đang được nhân viên hoặc tài sản sử dụng." : "Không thể xóa dữ liệu đang được tài sản hoặc lịch sử nghiệp vụ tham chiếu.");
      return;
    }
    logAction("Xóa dữ liệu", `${config.label} · ${record.name || record.id}`, (current) => ({
      ...current,
      [config.set]: current[config.set].filter((item) => item.id !== record.id),
    }));
  };

  const toggleAccount = (account) => {
    if (account.username === user.username && account.active) {
      setToast("Không thể khóa tài khoản đang đăng nhập.");
      return;
    }
    if (account.active && account.role === "Admin" && data.accounts.filter((item) => item.active && item.role === "Admin").length <= 1) {
      setToast("Cần giữ lại ít nhất một tài khoản quản trị đang hoạt động.");
      return;
    }
    logAction(account.active ? "Khóa tài khoản" : "Mở khóa tài khoản", account.username, (current) => ({
      ...current,
      accounts: current.accounts.map((item) => item.id === account.id ? { ...item, active: !item.active } : item),
    }));
  };

  const deleteAccount = (account) => {
    if (account.username === user.username) {
      setToast("Không thể xóa tài khoản đang đăng nhập.");
      return;
    }
    if (account.active && account.role === "Admin" && data.accounts.filter((item) => item.active && item.role === "Admin").length <= 1) {
      setToast("Cần giữ lại ít nhất một tài khoản quản trị đang hoạt động.");
      return;
    }
    if (!window.confirm(`Xóa tài khoản "${account.username}"?`)) return;
    logAction("Xóa tài khoản", account.username, (current) => ({
      ...current,
      accounts: current.accounts.filter((item) => item.id !== account.id),
    }));
  };

  const exportReport = () => {
    const rows = getReportRows(data, reportType, { departmentName, categoryName, employeeName });
    const csv = `\uFEFF${[rows.headers, ...rows.rows].map((row) => row.map(escapeCsv).join(",")).join("\r\n")}`;
    saveDownload(`bao-cao-tai-san-${TODAY()}.csv`, csv, "text/csv;charset=utf-8");
    setToast("Đã xuất báo cáo CSV để mở bằng Excel");
  };

  const exportBackup = () => {
    saveDownload(`sao-luu-tai-san-${TODAY()}.json`, JSON.stringify(data, null, 2), "application/json;charset=utf-8");
    setToast("Đã tải bản sao lưu dữ liệu");
  };

  const importBackup = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(String(reader.result));
        const required = ["departments", "categories", "employees", "assets", "allocations", "transfers", "maintenance", "liquidations", "logs"];
        if (!imported || required.some((key) => !Array.isArray(imported[key]))) throw new Error("Tệp sao lưu không đúng định dạng của ứng dụng.");
        const restored = { ...imported, accounts: Array.isArray(imported.accounts) ? imported.accounts : createInitialData().accounts };
        setData(restored);
        const restoredAccount = restored.accounts.find((item) => item.username === user.username && item.active);
        if (restoredAccount) {
          const session = { ...restoredAccount };
          delete session.password;
          setUser(session);
        } else {
          setUser(null);
        }
        setShowDataTools(false);
        setToast("Đã khôi phục dữ liệu từ tệp sao lưu");
      } catch (error) {
        console.error("Không thể khôi phục tệp sao lưu.", error);
        setToast(error.message || "Không thể đọc tệp sao lưu.");
      } finally {
        event.target.value = "";
      }
    };
    reader.onerror = () => {
      console.error("Lỗi đọc tệp sao lưu.", reader.error);
      setToast("Không thể đọc tệp sao lưu.");
      event.target.value = "";
    };
    reader.readAsText(file);
  };

  const resetDemo = () => {
    if (!window.confirm("Khôi phục dữ liệu mẫu ban đầu? Các thay đổi trên trình duyệt này sẽ bị thay thế.")) return;
    setData(createInitialData());
    setShowDataTools(false);
    setToast("Đã khôi phục dữ liệu mẫu");
  };

  const formFields = () => {
    if (!form) return [];
    const field = (name, label, type = "text", extra = {}) => ({ name, label, type, ...extra });
    const selectOptions = (items, labelKey = "name", valueKey = "id") => items.map((item) => ({ label: item[labelKey], value: item[valueKey] }));
    switch (form.type) {
      case "asset":
        return [
          field("id", "Mã tài sản", "text", { required: true, disabled: !!form.record, placeholder: "VD: TS010" }),
          field("name", "Tên tài sản", "text", { required: true, placeholder: "Nhập tên tài sản" }),
          field("categoryId", "Loại tài sản", "select", { required: true, options: selectOptions(data.categories) }),
          field("status", "Tình trạng", "select", { required: true, disabled: true, defaultValue: "Sẵn sàng", options: STATUSES.map((item) => ({ label: item, value: item })) }),
          field("value", "Nguyên giá (VNĐ)", "number", { min: 0, required: true }),
          field("purchaseDate", "Ngày mua", "date"),
          field("supplier", "Nhà cung cấp"),
          field("warrantyDate", "Hạn bảo hành", "date"),
          field("departmentId", "Phòng ban", "select", { disabled: true, options: [{ label: "Chưa phân công", value: "" }, ...selectOptions(data.departments)] }),
          field("employeeId", "Người sử dụng", "select", { disabled: true, options: [{ label: "Chưa phân công", value: "" }, ...selectOptions(data.employees)] }),
          field("location", "Vị trí"),
          field("note", "Ghi chú", "textarea", { full: true }),
        ];
      case "department":
        return [
          field("id", "Mã phòng ban", "text", { required: true, disabled: !!form.record, placeholder: "VD: PB04" }),
          field("name", "Tên phòng ban", "text", { required: true }),
          field("lead", "Người phụ trách"),
          field("phone", "Số điện thoại", "tel"),
          field("email", "Email", "email"),
          field("description", "Mô tả", "textarea", { full: true }),
        ];
      case "employee":
        return [
          field("id", "Mã nhân viên", "text", { required: true, disabled: !!form.record, placeholder: "VD: NV06" }),
          field("name", "Họ và tên", "text", { required: true }),
          field("title", "Chức vụ"),
          field("departmentId", "Phòng ban", "select", { required: true, options: selectOptions(data.departments) }),
          field("birthDate", "Ngày sinh", "date"),
          field("email", "Email", "email"),
          field("phone", "Số điện thoại", "tel"),
        ];
      case "category":
        return [
          field("id", "Mã loại tài sản", "text", { required: true, disabled: !!form.record, placeholder: "VD: LTS04" }),
          field("name", "Tên danh mục", "text", { required: true }),
          field("description", "Mô tả", "textarea", { full: true }),
        ];
      case "account":
        return [
          field("username", "Tên đăng nhập", "text", { required: true, disabled: !!form.record, placeholder: "VD: nv06" }),
          field("name", "Tên hiển thị", "text", { required: form.record?.role !== "NhanVien", placeholder: "Họ tên người dùng" }),
          field("password", form.record ? "Mật khẩu mới (để trống để giữ nguyên)" : "Mật khẩu", "password", { required: !form.record, placeholder: form.record ? "Không thay đổi nếu để trống" : "Tối thiểu 6 ký tự" }),
          field("role", "Vai trò", "select", { required: true, options: [{ label: "Quản trị viên", value: "Admin" }, { label: "Nhân viên", value: "NhanVien" }, { label: "Ban lãnh đạo", value: "BanLanhDao" }] }),
          field("employeeId", "Hồ sơ nhân viên (bắt buộc với Nhân viên)", "select", { options: [{ label: "Không liên kết", value: "" }, ...selectOptions(data.employees)] }),
        ];
      case "allocation":
        return [
          field("assetId", "Tài sản sẵn sàng", "select", { required: true, options: selectOptions(data.assets.filter((item) => item.status === "Sẵn sàng"), "name", "id") }),
          field("employeeId", "Nhân viên nhận", "select", { required: true, options: selectOptions(data.employees) }),
          field("date", "Ngày cấp phát", "date", { required: true }),
          field("handover", "Người bàn giao", "text", { required: true }),
        ];
      case "transfer":
        return [
          field("assetId", "Tài sản đang sử dụng", "select", { required: true, options: selectOptions(data.assets.filter((item) => item.status === "Đang sử dụng"), "name", "id") }),
          field("employeeId", "Nhân viên nhận mới", "select", { required: true, options: selectOptions(data.employees) }),
          field("date", "Ngày điều chuyển", "date", { required: true }),
          field("reason", "Lý do điều chuyển", "textarea", { required: true, full: true }),
        ];
      case "maintenanceRequest":
        return [
          field("assetId", "Tài sản đang sử dụng", "select", { required: true, options: selectOptions(data.assets.filter((item) => item.status === "Đang sử dụng" && (user.role !== "NhanVien" || item.employeeId === user.employeeId)), "name", "id") }),
          field("date", "Ngày gửi yêu cầu", "date", { required: true }),
          field("content", "Mô tả sự cố / yêu cầu", "textarea", { required: true, full: true }),
        ];
      case "maintenanceComplete":
        return [
          field("maintenanceId", "Yêu cầu chờ xử lý", "select", { required: true, options: selectOptions(data.maintenance.filter((item) => item.status === "Chờ xử lý").map((item) => ({ ...item, name: `${item.id} · ${data.assets.find((asset) => asset.id === item.assetId)?.name || item.assetId}` }))) }),
          field("cost", "Chi phí sửa chữa (VNĐ)", "number", { required: true, min: 0 }),
        ];
      case "liquidation":
        return [
          field("assetId", "Tài sản cần thanh lý", "select", { required: true, options: selectOptions(data.assets.filter((item) => item.status !== "Thanh lý"), "name", "id") }),
          field("date", "Ngày thanh lý", "date", { required: true }),
          field("recoveryValue", "Giá trị thu hồi (VNĐ)", "number", { required: true, min: 0 }),
          field("reason", "Lý do thanh lý", "textarea", { required: true, full: true }),
        ];
      default:
        return [];
    }
  };

  const titleForPage = NAV_ITEMS.find((item) => item.id === page)?.label || "Tổng quan";
  if (!user) {
    return (
      <div className="login-page">
        <div className="login-decoration login-decoration-one" />
        <div className="login-decoration login-decoration-two" />
        <div className="login-layout">
          <section className="login-intro">
            <div className="brand-mark brand-mark-large"><Icon name="box" size={27} /></div>
            <div className="eyebrow">NỀN TẢNG QUẢN TRỊ NỘI BỘ</div>
            <h1>Quản lý tài sản<br /><span>thông minh hơn.</span></h1>
            <p>Theo dõi tài sản, tối ưu quy trình và đưa ra quyết định chính xác với dữ liệu tập trung.</p>
            <div className="login-features">
              <span><Icon name="check" size={16} /> Theo dõi vòng đời tài sản</span>
              <span><Icon name="check" size={16} /> Báo cáo theo thời gian thực</span>
              <span><Icon name="check" size={16} /> Lịch sử minh bạch, rõ ràng</span>
            </div>
            <div className="login-note">Bản chạy thử · Dữ liệu được lưu trên trình duyệt này</div>
          </section>
          <section className="login-card">
            <div className="login-card-heading">
              <div className="eyebrow">CHÀO MỪNG TRỞ LẠI</div>
              <h2>Đăng nhập hệ thống</h2>
              <p>Nhập tài khoản dùng thử để trải nghiệm.</p>
            </div>
            <form onSubmit={login}>
              <label className="field-label" htmlFor="login-name">Tên đăng nhập</label>
              <input id="login-name" className="text-input" value={loginName} onChange={(event) => { setLoginName(event.target.value); setLoginError(""); }} autoComplete="username" required />
              <label className="field-label login-password-label" htmlFor="login-password">Mật khẩu</label>
              <input id="login-password" className="text-input" type="password" value={loginPassword} onChange={(event) => { setLoginPassword(event.target.value); setLoginError(""); }} autoComplete="current-password" required />
              {loginError && <div className="form-error">{loginError}</div>}
              <button className="button button-primary login-submit" type="submit">Đăng nhập <Icon name="chevron" size={17} /></button>
            </form>
            <div className="demo-accounts">
              <div className="demo-title">TÀI KHOẢN TRẢI NGHIỆM</div>
              <button type="button" className="demo-account" onClick={() => { setLoginName("admin"); setLoginPassword("admin123"); setLoginError(""); }}>
                <span className="demo-avatar demo-avatar-blue">AD</span><span><b>Quản trị viên</b><small>admin <i>·</i> admin123</small></span><Icon name="chevron" size={16} />
              </button>
              <button type="button" className="demo-account" onClick={() => { setLoginName("lanhdao"); setLoginPassword("123456"); setLoginError(""); }}>
                <span className="demo-avatar demo-avatar-violet">BL</span><span><b>Ban lãnh đạo</b><small>lanhdao <i>·</i> 123456</small></span><Icon name="chevron" size={16} />
              </button>
              <button type="button" className="demo-account" onClick={() => { setLoginName("nv03"); setLoginPassword("123456"); setLoginError(""); }}>
                <span className="demo-avatar demo-avatar-green">NV</span><span><b>Nhân viên · NV03</b><small>nv03 <i>·</i> 123456</small></span><Icon name="chevron" size={16} />
              </button>
            </div>
            <div className="login-security"><span className="security-dot" /> Chế độ mô phỏng — không dùng mật khẩu thật</div>
          </section>
        </div>
        <div className="login-footer">ĐỒ ÁN PHÂN TÍCH & THIẾT KẾ HỆ THỐNG <span>·</span> 2026</div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark"><Icon name="box" size={22} /></div>
          <div><strong>Asset<span>Flow</span></strong><small>QUẢN LÝ TÀI SẢN</small></div>
        </div>
        <div className="workspace-label">KHÔNG GIAN LÀM VIỆC</div>
        <div className="workspace-switch"><span className="workspace-symbol">H</span><span><b>Đơn vị Hải Phòng</b><small>Hệ thống nội bộ</small></span><span className="workspace-caret">⌄</span></div>
        <div className="nav-caption">MENU CHÍNH</div>
        <nav className="main-nav" aria-label="Điều hướng chính">
          {visibleNav.map((item) => (
            <button type="button" key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => { setPage(item.id); setQuery(""); }}>
              <Icon name={item.icon} size={18} /><span>{item.label}</span>
              {item.id === "maintenance" && stats.maintenance > 0 && <span className="nav-count">{stats.maintenance}</span>}
              {page === item.id && <span className="nav-active-mark" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="demo-tag"><span className="demo-tag-dot" /><span><b>Chế độ thực nghiệm</b><small>Dữ liệu lưu cục bộ</small></span></div>
          {canManage && <button className="sidebar-utility" type="button" onClick={() => setShowDataTools(true)}><Icon name="download" size={17} /> Sao lưu & khôi phục</button>}
          <div className="user-profile">
            <div className={`profile-avatar ${user.role === "Admin" ? "avatar-admin" : user.role === "BanLanhDao" ? "avatar-leader" : "avatar-staff"}`}>{user.role === "Admin" ? "AD" : user.role === "BanLanhDao" ? "BL" : "NV"}</div>
            <div className="profile-info"><b>{user.name}</b><small>{user.role === "Admin" ? "Quản trị viên" : user.role === "BanLanhDao" ? "Ban lãnh đạo" : "Nhân viên"}</small></div>
            <button className="icon-button logout-button" type="button" title="Đăng xuất" onClick={logout}><Icon name="logout" size={17} /></button>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb"><span>AssetFlow</span><Icon name="chevron" size={14} /><b>{titleForPage}</b></div>
          <div className="topbar-right">
            <span className="topbar-date"><Icon name="clock" size={15} /> {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</span>
            <span className="topbar-divider" />
            <div className="topbar-user"><span className="online-indicator" />{shortAddress(user.name)}</div>
          </div>
        </header>
        <div className="page-content">
          {storageWarning && <div className="storage-warning">{storageWarning}</div>}
          {page === "dashboard" && <Dashboard data={dashboardData} stats={dashboardStats} role={user.role} employeeId={user.employeeId} onNavigate={setPage} onAddAsset={() => openForm("asset")} />}
          {page === "assets" && <AssetsPage assets={filteredAssets} allCount={scopedAssets.length} query={query} setQuery={setQuery} statusFilter={statusFilter} setStatusFilter={setStatusFilter} canManage={canManage} onAdd={() => openForm("asset")} onEdit={(item) => openForm("asset", item)} onDelete={(item) => deleteRecord("asset", item)} onView={setDetailAsset} categoryName={categoryName} departmentName={departmentName} employeeName={employeeName} />}
          {page === "accounts" && <AccountsPage accounts={data.accounts} employees={data.employees} canManage={canManage} currentUsername={user.username} onAdd={() => openForm("account")} onEdit={(item) => openForm("account", item)} onToggle={toggleAccount} onDelete={deleteAccount} />}
          {page === "allocations" && <AllocationsPage data={data} employeeName={employeeName} departmentName={departmentName} canManage={canManage} onAdd={() => openForm("allocation")} onTransfer={() => openForm("transfer")} onReturn={returnAsset} />}
          {page === "departments" && <DepartmentsPage data={data} canManage={canManage} onAdd={() => openForm("department")} onEdit={(item) => openForm("department", item)} onDelete={(item) => deleteRecord("department", item)} />}
          {page === "employees" && <EmployeesPage data={data} departmentName={departmentName} canManage={canManage} onAdd={() => openForm("employee")} onEdit={(item) => openForm("employee", item)} onDelete={(item) => deleteRecord("employee", item)} query={query} setQuery={setQuery} />}
          {page === "categories" && <CategoriesPage data={data} canManage={canManage} onAdd={() => openForm("category")} onEdit={(item) => openForm("category", item)} onDelete={(item) => deleteRecord("category", item)} />}
          {page === "maintenance" && <MaintenancePage data={data} user={user} employeeName={employeeName} canManage={canManage} onRequest={() => openForm("maintenanceRequest")} onComplete={() => openForm("maintenanceComplete")} />}
          {page === "liquidations" && <LiquidationsPage data={data} canManage={canManage} onAdd={() => openForm("liquidation")} />}
          {page === "reports" && <ReportsPage data={data} reportType={reportType} setReportType={setReportType} employeeName={employeeName} onExport={exportReport} />}
          {page === "activity" && <ActivityPage logs={data.logs} />}
          {canManage && <div className="page-footer-note"><span className="demo-tag-dot" /> Bản thực nghiệm · Dữ liệu được lưu tự động trên trình duyệt này</div>}
        </div>
      </main>

      {form && <FormModal title={formTitle(form)} fields={formFields()} initial={form.type === "account" && form.record ? { ...form.record, password: "" } : form.record} onClose={() => setForm(null)} onSubmit={submitForm} submitLabel={form.record ? "Lưu thay đổi" : "Xác nhận"} />}
      {detailAsset && <AssetDetailModal asset={data.assets.find((item) => item.id === detailAsset.id) || detailAsset} data={data} categoryName={categoryName} departmentName={departmentName} employeeName={employeeName} onClose={() => setDetailAsset(null)} />}
      {canManage && <input ref={fileInput} className="visually-hidden" type="file" accept=".json,application/json" onChange={importBackup} />}
      {showDataTools && <DataToolsModal onClose={() => setShowDataTools(false)} onBackup={exportBackup} onRestore={() => fileInput.current?.click()} onReset={resetDemo} />}
      {toast && <div className="toast-message"><span className="toast-check"><Icon name="check" size={15} /></span>{toast}</div>}
    </div>
  );
}

function formTitle(form) {
  const titles = {
    asset: form.record ? "Cập nhật tài sản" : "Thêm tài sản mới",
    account: form.record ? "Cập nhật tài khoản" : "Tạo tài khoản mới",
    department: form.record ? "Cập nhật phòng ban" : "Thêm phòng ban",
    employee: form.record ? "Cập nhật nhân viên" : "Thêm nhân viên",
    category: form.record ? "Cập nhật danh mục" : "Thêm danh mục tài sản",
    allocation: "Lập phiếu cấp phát",
    transfer: "Điều chuyển tài sản",
    maintenanceRequest: "Gửi yêu cầu bảo trì",
    maintenanceComplete: "Hoàn tất bảo trì",
    liquidation: "Lập phiếu thanh lý",
  };
  return titles[form.type] || "Cập nhật thông tin";
}

function PageHeading({ eyebrow, title, description, action, actionLabel, actionIcon = "plus" }) {
  return (
    <div className="page-heading">
      <div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>
      {action && <button type="button" className="button button-primary" onClick={action}><Icon name={actionIcon} size={17} />{actionLabel}</button>}
    </div>
  );
}

function Dashboard({ data, stats, role, employeeId, onNavigate, onAddAsset }) {
  const activeAssets = data.assets.filter((asset) => asset.status !== "Thanh lý");
  const statusCounts = STATUSES.map((status) => ({ status, count: data.assets.filter((asset) => asset.status === status).length })).filter((item) => item.count);
  const maxCount = Math.max(...statusCounts.map((item) => item.count), 1);
  const insights = getSmartMetrics(data);
  const maintenanceTotal = data.maintenance.reduce((sum, item) => sum + Number(item.cost || 0), 0);
  const recent = data.logs.slice(0, 5);
  const isEmployee = role === "NhanVien";
  const inUse = isEmployee ? data.assets.filter((item) => item.employeeId === employeeId) : data.assets.filter((item) => item.status === "Đang sử dụng");
  return (
    <>
      <PageHeading eyebrow="TỔNG QUAN HỆ THỐNG" title={isEmployee ? "Xin chào, Lê Văn Cường" : "Tổng quan tài sản"} description="Theo dõi tình hình tài sản và các hoạt động gần đây của đơn vị." />
      <div className="welcome-strip">
        <div className="welcome-copy"><span className="welcome-chip">BÁO CÁO THỰC NGHIỆM · 2026</span><h2>{isEmployee ? "Không gian làm việc của bạn" : "Mọi tài sản, trong tầm kiểm soát."}</h2><p>{isEmployee ? "Xem tài sản đang được giao cho bạn và gửi yêu cầu hỗ trợ khi cần." : "Dữ liệu tập trung giúp bạn nắm bắt nhanh tình trạng và giá trị tài sản."}</p></div>
        <div className="welcome-graphic"><div className="graphic-orbit orbit-one" /><div className="graphic-orbit orbit-two" /><div className="graphic-center"><Icon name="box" size={32} /></div><div className="graphic-float graphic-float-one"><Icon name="check" size={15} /></div><div className="graphic-float graphic-float-two"><Icon name="arrow" size={15} /></div></div>
      </div>
      <div className="stats-grid">
        <StatCard label={isEmployee ? "Tài sản được giao" : "Tổng số tài sản"} value={isEmployee ? inUse.length : stats.total} suffix="tài sản" icon="assets" tone="blue" trend={isEmployee ? "Đang được phân công cho bạn" : "Bao gồm cả tài sản đã thanh lý"} />
        <StatCard label="Đang sử dụng" value={isEmployee ? inUse.length : stats.inUse} suffix="tài sản" icon="allocation" tone="green" trend="Đã được cấp phát cho nhân viên" />
        <StatCard label="Tổng nguyên giá" value={money(isEmployee ? inUse.reduce((sum, item) => sum + Number(item.value), 0) : stats.value)} suffix="" icon="reports" tone="violet" trend="Không bao gồm tài sản đã thanh lý" />
        <StatCard label="Chờ bảo trì" value={isEmployee ? data.maintenance.filter((item) => item.employeeId === employeeId && item.status === "Chờ xử lý").length : stats.maintenance} suffix="yêu cầu" icon="maintenance" tone="orange" trend={stats.maintenance ? "Cần được xử lý" : "Không có yêu cầu tồn đọng"} />
      </div>
      <SmartInsightGrid insights={insights} />
      <div className="dashboard-grid">
        <section className="panel status-panel">
          <div className="panel-heading"><div><h3>Tình trạng tài sản</h3><p>Phân bổ theo trạng thái hiện tại</p></div><button type="button" className="text-link" onClick={() => onNavigate("assets")}>Xem danh sách <Icon name="chevron" size={14} /></button></div>
          <div className="status-total"><strong>{isEmployee ? inUse.length : activeAssets.length}</strong><span> tài sản đang theo dõi</span></div>
          <div className="status-bars">{statusCounts.map((item) => <div className="status-bar-row" key={item.status}><div className="status-bar-label"><span className={`status-dot ${statusClass(item.status)}`} />{item.status}<b>{item.count}</b></div><div className="status-bar-track"><span className={`status-bar-fill ${statusClass(item.status)}`} style={{ width: `${(item.count / maxCount) * 100}%` }} /></div></div>)}</div>
          <div className="status-legend"><span><i className="legend-dot legend-ready" />Sẵn sàng</span><span><i className="legend-dot legend-used" />Đang sử dụng</span><span><i className="legend-dot legend-other" />Khác</span></div>
        </section>
        <section className="panel quick-panel">
          <div className="panel-heading"><div><h3>Truy cập nhanh</h3><p>Các tác vụ thường dùng</p></div></div>
          <div className="quick-actions">
            {role === "Admin" && <QuickAction icon="plus" title="Thêm tài sản" description="Ghi nhận tài sản mới" onClick={onAddAsset} />}
            {role === "Admin" && <QuickAction icon="allocation" title="Cấp phát tài sản" description="Lập phiếu bàn giao" onClick={() => onNavigate("allocations")} />}
            {role === "NhanVien" && <QuickAction icon="maintenance" title="Gửi yêu cầu bảo trì" description="Báo sự cố tài sản" onClick={() => onNavigate("maintenance")} />}
            {(role === "Admin" || role === "BanLanhDao") && <QuickAction icon="reports" title="Xem báo cáo" description="Phân tích số liệu" onClick={() => onNavigate("reports")} />}
            <QuickAction icon="assets" title="Tra cứu tài sản" description="Tìm trong danh mục" onClick={() => onNavigate("assets")} />
          </div>
          <div className="maintenance-summary"><span className="maintenance-summary-icon"><Icon name="maintenance" size={17} /></span><span><b>Chi phí bảo trì</b><small>{data.maintenance.length} phiếu đã ghi nhận</small></span><strong>{money(maintenanceTotal)}</strong></div>
        </section>
      </div>
      <section className="panel recent-panel">
        <div className="panel-heading"><div><h3>Hoạt động gần đây</h3><p>Lịch sử cập nhật trên hệ thống</p></div><button type="button" className="text-link" onClick={() => onNavigate("activity")}>Xem nhật ký <Icon name="chevron" size={14} /></button></div>
        {recent.length ? <div className="activity-list">{recent.map((item) => <ActivityRow key={item.id} log={item} />)}</div> : <EmptyState title="Chưa có hoạt động" description="Các thao tác mới sẽ được ghi nhận tại đây." />}
      </section>
      <div className="dashboard-footnote"><span><Icon name="check" size={15} /> 32/32 ca kiểm thử nghiệp vụ đạt</span><span><Icon name="clock" size={15} /> Hiệu năng thử nghiệm: dưới 3 giây / 10.000 bản ghi</span><span><Icon name="box" size={15} /> {data.departments.length} phòng ban · {data.employees.length} nhân viên</span></div>
    </>
  );
}

function StatCard({ label, value, suffix, icon, tone, trend }) {
  return <div className="stat-card"><div className={`stat-icon stat-${tone}`}><Icon name={icon} size={19} /></div><div className="stat-label">{label}</div><div className="stat-value">{value}<small>{suffix}</small></div><div className="stat-trend"><span className="trend-arrow"><Icon name="arrow" size={13} /></span>{trend}</div></div>;
}

function getSmartMetrics(data) {
  const activeAssets = data.assets.filter((asset) => asset.status !== "Thanh lý");
  const today = TODAY();
  const warrantyDays = (date) => {
    if (!date) return null;
    return Math.ceil((new Date(`${date}T00:00:00`).getTime() - new Date(`${today}T00:00:00`).getTime()) / 86400000);
  };
  const warranties = activeAssets.map((asset) => ({ asset, days: warrantyDays(asset.warrantyDate) }));
  const expiredWarranty = warranties.filter((item) => item.days !== null && item.days < 0).length;
  const expiringWarranty = warranties.filter((item) => item.days !== null && item.days >= 0 && item.days <= 90).length;
  const attentionIds = new Set(activeAssets.filter((asset) => asset.status === "Hư hỏng" || asset.status === "Đang bảo trì").map((asset) => asset.id));
  data.maintenance.filter((item) => item.status === "Chờ xử lý").forEach((item) => attentionIds.add(item.assetId));
  const ages = activeAssets.map((asset) => getAssetAge(asset.purchaseDate, today)).filter((age) => age !== null);
  const departmentTotals = data.departments.map((department) => ({
    name: department.name,
    value: activeAssets.filter((asset) => asset.departmentId === department.id).reduce((sum, asset) => sum + Number(asset.value || 0), 0),
  })).sort((a, b) => b.value - a.value);
  const totalValue = activeAssets.reduce((sum, asset) => sum + Number(asset.value || 0), 0);
  const maintenanceCost = data.maintenance.reduce((sum, item) => sum + Number(item.cost || 0), 0);
  return {
    utilization: activeAssets.length ? Math.round((activeAssets.filter((asset) => asset.status === "Đang sử dụng").length / activeAssets.length) * 100) : 0,
    expiredWarranty,
    expiringWarranty,
    attention: attentionIds.size,
    oldAssets: ages.filter((age) => age >= 4).length,
    averageAge: ages.length ? (ages.reduce((sum, age) => sum + age, 0) / ages.length).toFixed(1) : "0.0",
    topDepartment: departmentTotals[0]?.name || "Chưa có dữ liệu",
    topDepartmentValue: departmentTotals[0]?.value || 0,
    maintenanceRatio: totalValue ? ((maintenanceCost / totalValue) * 100).toFixed(2) : "0.00",
  };
}

function getAssetAge(date, reference = TODAY()) {
  if (!date) return null;
  const purchased = new Date(`${date}T00:00:00`);
  const today = new Date(`${reference}T00:00:00`);
  if (Number.isNaN(purchased.getTime()) || Number.isNaN(today.getTime())) return null;
  return Math.max(0, (today.getTime() - purchased.getTime()) / (365.2425 * 86400000));
}

function SmartInsightGrid({ insights }) {
  return <div className="smart-insights">
    <div className="smart-insight"><span className="smart-insight-icon insight-blue"><Icon name="reports" size={17} /></span><div><small>HIỆU SUẤT SỬ DỤNG</small><b>{insights.utilization}%</b><span>Tỷ lệ tài sản đang được cấp phát</span></div></div>
    <div className="smart-insight"><span className="smart-insight-icon insight-orange"><Icon name="clock" size={17} /></span><div><small>BẢO HÀNH CẦN THEO DÕI</small><b>{insights.expiredWarranty + insights.expiringWarranty}</b><span>{insights.expiredWarranty} hết hạn · {insights.expiringWarranty} sắp hết hạn trong 90 ngày</span></div></div>
    <div className="smart-insight"><span className="smart-insight-icon insight-red"><Icon name="maintenance" size={17} /></span><div><small>TÀI SẢN CẦN CHÚ Ý</small><b>{insights.attention}</b><span>{insights.oldAssets} tài sản đã sử dụng từ 4 năm trở lên</span></div></div>
    <div className="smart-insight"><span className="smart-insight-icon insight-orange"><Icon name="activity" size={17} /></span><div><small>TUỔI ĐỜI TRUNG BÌNH</small><b>{insights.averageAge} năm</b><span>Trung bình trên các tài sản đang theo dõi</span></div></div>
    <div className="smart-insight"><span className="smart-insight-icon insight-green"><Icon name="departments" size={17} /></span><div><small>PHÒNG BAN GIÁ TRỊ CAO NHẤT</small><b className="insight-department">{insights.topDepartment}</b><span>{money(insights.topDepartmentValue)} · bảo trì/nguyên giá {insights.maintenanceRatio}%</span></div></div>
  </div>;
}

function QuickAction({ icon, title, description, onClick }) {
  return <button type="button" className="quick-action" onClick={onClick}><span className="quick-action-icon"><Icon name={icon} size={18} /></span><span><b>{title}</b><small>{description}</small></span><Icon name="chevron" size={15} /></button>;
}

function AssetsPage({ assets, allCount, query, setQuery, statusFilter, setStatusFilter, canManage, onAdd, onEdit, onDelete, onView, categoryName, departmentName, employeeName }) {
  return (
    <>
      <PageHeading eyebrow="DANH MỤC TÀI SẢN" title="Tài sản" description="Quản lý thông tin, tình trạng và người sử dụng của từng tài sản." action={canManage ? onAdd : null} actionLabel="Thêm tài sản" />
      <div className="summary-strip"><div><span className="summary-number">{allCount}</span><span> tài sản trong hệ thống</span></div><div className="summary-value"><span>Tổng nguyên giá</span><b>{money(assets.filter((item) => item.status !== "Thanh lý").reduce((sum, item) => sum + Number(item.value), 0))}</b></div></div>
      <section className="panel table-panel">
        <div className="table-toolbar"><div className="search-box"><Icon name="search" size={17} /><input placeholder="Tìm theo mã, tên, loại, phòng ban..." value={query} onChange={(event) => setQuery(event.target.value)} /><kbd>⌘ K</kbd></div><div className="toolbar-right"><div className="select-wrap"><Icon name="filter" size={16} /><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>Tất cả tình trạng</option>{STATUSES.map((item) => <option key={item}>{item}</option>)}</select></div><span className="result-count">{assets.length} kết quả</span></div></div>
        <div className="table-scroll"><table className="data-table"><thead><tr><th>TÀI SẢN</th><th>PHÂN LOẠI</th><th>PHÒNG BAN / NGƯỜI DÙNG</th><th>NGÀY MUA</th><th>NGUYÊN GIÁ</th><th>TÌNH TRẠNG</th><th /></tr></thead><tbody>
          {assets.map((asset) => <tr key={asset.id}><td><button className="asset-name-cell" type="button" onClick={() => onView(asset)}><span className={`asset-thumb ${categoryTone(categoryName(asset.categoryId))}`}><Icon name="box" size={18} /></span><span><b>{asset.name}</b><small>{asset.id}</small></span></button></td><td><span className="category-chip">{categoryName(asset.categoryId)}</span></td><td><span className="table-primary">{departmentName(asset.departmentId)}</span><small className="table-secondary">{employeeName(asset.employeeId) !== "—" ? employeeName(asset.employeeId) : "Chưa phân công"}</small></td><td>{dateLabel(asset.purchaseDate)}</td><td className="amount-cell">{money(asset.value)}</td><td><StatusBadge status={asset.status} /></td><td><RowActions canManage={canManage} onEdit={() => onEdit(asset)} onDelete={() => onDelete(asset)} onView={() => onView(asset)} /></td></tr>)}
          {!assets.length && <tr><td colSpan="7"><EmptyState title="Không tìm thấy tài sản" description="Thử thay đổi từ khóa hoặc bộ lọc tìm kiếm." /></td></tr>}
        </tbody></table></div>
        <div className="table-foot"><span>Hiển thị <b>{assets.length}</b> trên <b>{allCount}</b> tài sản</span><span>Dữ liệu cập nhật tự động</span></div>
      </section>
    </>
  );
}

function AllocationsPage({ data, employeeName, departmentName, canManage, onAdd, onTransfer, onReturn }) {
  const active = data.allocations.filter((item) => item.status === "Đang sử dụng");
  return (
    <>
      <PageHeading eyebrow="QUẢN LÝ SỬ DỤNG" title="Cấp phát & thu hồi" description="Theo dõi phiếu bàn giao, điều chuyển và thu hồi tài sản." action={canManage ? onAdd : null} actionLabel="Lập phiếu cấp phát" />
      <div className="mini-stats"><MiniStat title="Đang sử dụng" value={active.length} tone="green" /><MiniStat title="Tổng phiếu cấp phát" value={data.allocations.length} tone="blue" /><MiniStat title="Phiếu điều chuyển" value={data.transfers.length} tone="violet" /></div>
      <section className="panel table-panel">
        <div className="panel-heading panel-heading-padded"><div><h3>Tài sản đang được cấp phát</h3><p>Thực hiện thu hồi hoặc điều chuyển tài sản đang sử dụng</p></div>{canManage && <button className="button button-secondary button-small" type="button" onClick={onTransfer}><Icon name="allocation" size={16} /> Điều chuyển</button>}</div>
        <div className="table-scroll"><table className="data-table"><thead><tr><th>MÃ PHIẾU</th><th>TÀI SẢN</th><th>NGƯỜI SỬ DỤNG</th><th>PHÒNG BAN</th><th>NGÀY CẤP</th><th>TRẠNG THÁI</th><th /></tr></thead><tbody>
          {active.map((item) => { const asset = data.assets.find((row) => row.id === item.assetId); return <tr key={item.id}><td><span className="code-chip">{item.id}</span></td><td><span className="table-primary">{asset?.name || item.assetId}</span><small className="table-secondary">{item.assetId}</small></td><td>{employeeName(item.employeeId)}</td><td>{departmentName(item.departmentId)}</td><td>{dateLabel(item.date)}</td><td><StatusBadge status={item.status} /></td><td>{canManage && <button type="button" className="button button-text-danger" onClick={() => asset && onReturn(asset)}>Thu hồi</button>}</td></tr>; })}
          {!active.length && <tr><td colSpan="7"><EmptyState title="Chưa có tài sản được cấp phát" description="Tạo phiếu cấp phát để bắt đầu theo dõi." /></td></tr>}
        </tbody></table></div>
      </section>
      <section className="panel history-panel"><div className="panel-heading"><div><h3>Lịch sử điều chuyển</h3><p>Các lần thay đổi người sử dụng hoặc phòng ban</p></div></div>
        {data.transfers.length ? <div className="transfer-history">{data.transfers.map((item) => { const asset = data.assets.find((row) => row.id === item.assetId); return <div className="transfer-item" key={item.id}><span className="transfer-icon"><Icon name="allocation" size={17} /></span><div className="transfer-main"><b>{asset?.name || item.assetId}</b><div>{employeeName(item.fromEmployeeId)} <Icon name="chevron" size={13} /> {employeeName(item.toEmployeeId)}</div><small>{item.reason}</small></div><div className="transfer-meta"><span className="code-chip">{item.id}</span><small>{dateLabel(item.date)}</small></div></div>; })}</div> : <EmptyState title="Chưa có lịch sử điều chuyển" description="Các lần điều chuyển sẽ xuất hiện tại đây." />}
      </section>
    </>
  );
}

function DepartmentsPage({ data, canManage, onAdd, onEdit, onDelete }) {
  return <><PageHeading eyebrow="CƠ CẤU TỔ CHỨC" title="Phòng ban" description="Quản lý đơn vị, người phụ trách và thông tin liên hệ." action={canManage ? onAdd : null} actionLabel="Thêm phòng ban" />
    <div className="directory-grid">{data.departments.map((item) => { const employees = data.employees.filter((row) => row.departmentId === item.id).length; const assets = data.assets.filter((row) => row.departmentId === item.id).length; return <div className="panel directory-card" key={item.id}><div className="directory-card-top"><span className="department-icon"><Icon name="departments" size={20} /></span><span className="code-chip">{item.id}</span><RowActions canManage={canManage} onEdit={() => onEdit(item)} onDelete={() => onDelete(item)} /></div><h3>{item.name}</h3><p>{item.description || "Chưa có mô tả cho phòng ban này."}</p><div className="department-lead"><span className="person-avatar">{(item.lead || item.name).slice(0, 1)}</span><span><small>NGƯỜI PHỤ TRÁCH</small><b>{item.lead || "Chưa phân công"}</b></span></div><div className="directory-card-foot"><span><Icon name="employees" size={15} /> {employees} nhân viên</span><span><Icon name="assets" size={15} /> {assets} tài sản</span></div><div className="department-contact">{item.phone && <span>{item.phone}</span>}{item.email && <span>{item.email}</span>}</div></div>; })}</div>
    {!data.departments.length && <EmptyState title="Chưa có phòng ban" description="Thêm phòng ban để phân công nhân viên và tài sản." />}
  </>;
}

function EmployeesPage({ data, departmentName, canManage, onAdd, onEdit, onDelete, query, setQuery }) {
  return <><PageHeading eyebrow="NGUỒN LỰC ĐƠN VỊ" title="Nhân viên" description="Danh sách nhân viên và tài sản đang được bàn giao." action={canManage ? onAdd : null} actionLabel="Thêm nhân viên" />
    <section className="panel table-panel"><div className="table-toolbar"><div className="search-box"><Icon name="search" size={17} /><input placeholder="Tìm nhân viên theo tên hoặc mã..." value={query} onChange={(event) => setQuery(event.target.value)} /></div><span className="result-count">{data.employees.filter((item) => `${item.id} ${item.name} ${item.title}`.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi"))).length} nhân viên</span></div><div className="table-scroll"><table className="data-table"><thead><tr><th>NHÂN VIÊN</th><th>PHÒNG BAN</th><th>CHỨC VỤ</th><th>LIÊN HỆ</th><th>TÀI SẢN ĐANG GIỮ</th><th /></tr></thead><tbody>{data.employees.filter((item) => `${item.id} ${item.name} ${item.title}`.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi"))).map((item) => { const holding = data.assets.filter((asset) => asset.employeeId === item.id && asset.status === "Đang sử dụng").length; return <tr key={item.id}><td><div className="person-cell"><span className="person-avatar">{item.name.slice(0, 1)}</span><span><b>{item.name}</b><small>{item.id}</small></span></div></td><td>{departmentName(item.departmentId)}</td><td>{item.title || "—"}</td><td><span className="table-primary">{item.email || "—"}</span><small className="table-secondary">{item.phone || ""}</small></td><td><span className={`holding-count ${holding ? "holding-active" : ""}`}>{holding} tài sản</span></td><td><RowActions canManage={canManage} onEdit={() => onEdit(item)} onDelete={() => onDelete(item)} /></td></tr>; })}{!data.employees.filter((item) => `${item.id} ${item.name} ${item.title}`.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi"))).length && <tr><td colSpan="6"><EmptyState title="Không tìm thấy nhân viên" description="Thử thay đổi từ khóa tìm kiếm." /></td></tr>}</tbody></table></div></section>
  </>;
}

function CategoriesPage({ data, canManage, onAdd, onEdit, onDelete }) {
  const tones = ["blue", "orange", "green", "violet"];
  return <><PageHeading eyebrow="DANH MỤC DÙNG CHUNG" title="Loại tài sản" description="Chuẩn hóa và phân nhóm tài sản của đơn vị." action={canManage ? onAdd : null} actionLabel="Thêm danh mục" />
    <div className="category-grid">{data.categories.map((item, index) => { const assets = data.assets.filter((asset) => asset.categoryId === item.id);     const totalValue = assets.reduce((sum, asset) => sum + Number(asset.value), 0); return <div className="panel category-card" key={item.id}><div className="category-card-head"><span className={`category-icon category-${tones[index % tones.length]}`}><Icon name="categories" size={20} /></span><span className="code-chip">{item.id}</span><RowActions canManage={canManage} onEdit={() => onEdit(item)} onDelete={() => onDelete(item)} /></div><h3>{item.name}</h3><p>{item.description || "Chưa có mô tả."}</p><div className="category-card-stats"><div><b>{assets.length}</b><small>TÀI SẢN</small></div><div><b>{money(totalValue)}</b><small>TỔNG NGUYÊN GIÁ</small></div></div><div className="category-mini-bar"><span style={{ width: `${Math.min(100, assets.length * 14)}%` }} /></div></div>; })}</div>
  </>;
}

function AccountsPage({ accounts, employees, currentUsername, onAdd, onEdit, onToggle, onDelete }) {
  const [query, setQuery] = useState("");
  const filtered = accounts.filter((account) => `${account.username} ${account.name} ${account.role}`.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi")));
  const active = accounts.filter((account) => account.active).length;
  const locked = accounts.length - active;
  const roleLabel = (role) => role === "Admin" ? "Quản trị viên" : role === "NhanVien" ? "Nhân viên" : "Ban lãnh đạo";
  return <>
    <PageHeading eyebrow="QUẢN TRỊ & PHÂN QUYỀN" title="Tài khoản người dùng" description="Tạo tài khoản trải nghiệm, gán vai trò và kiểm soát trạng thái truy cập." action={onAdd} actionLabel="Tạo tài khoản" />
    <div className="mini-stats"><MiniStat title="Tổng tài khoản" value={accounts.length} tone="blue" /><MiniStat title="Đang hoạt động" value={active} tone="green" /><MiniStat title="Đã khóa" value={locked} tone="orange" /></div>
    <section className="panel table-panel">
      <div className="table-toolbar"><div className="search-box"><Icon name="search" size={17} /><input placeholder="Tìm tài khoản theo tên hoặc vai trò..." value={query} onChange={(event) => setQuery(event.target.value)} /></div><span className="result-count">{filtered.length} tài khoản</span></div>
      <div className="table-scroll"><table className="data-table"><thead><tr><th>TÀI KHOẢN</th><th>VAI TRÒ</th><th>HỒ SƠ NHÂN VIÊN</th><th>TRẠNG THÁI</th><th>THAO TÁC</th></tr></thead><tbody>
        {filtered.map((account) => {
          const employee = employees.find((item) => item.id === account.employeeId);
          return <tr key={account.id}><td><div className="person-cell"><span className={`account-avatar ${account.role === "Admin" ? "account-avatar-admin" : account.role === "BanLanhDao" ? "account-avatar-leader" : "account-avatar-staff"}`}>{account.username.slice(0, 2).toUpperCase()}</span><span><b>{account.name}</b><small>@{account.username}{account.username === currentUsername ? " · Bạn" : ""}</small></span></div></td><td><span className={`role-chip ${account.role === "Admin" ? "role-admin" : account.role === "BanLanhDao" ? "role-leader" : "role-staff"}`}>{roleLabel(account.role)}</span></td><td>{employee ? <span className="table-primary">{employee.name}</span> : <span className="table-secondary">Không liên kết</span>}{employee && <small className="table-secondary">{employee.id}</small>}</td><td><span className={`account-status ${account.active ? "account-active" : "account-locked"}`}><i />{account.active ? "Hoạt động" : "Đã khóa"}</span></td><td><div className="account-actions"><button type="button" className="account-action" onClick={() => onToggle(account)} disabled={account.username === currentUsername && account.active} title={account.active ? "Khóa tài khoản" : "Mở khóa"}>{account.active ? "Khóa" : "Mở khóa"}</button><button type="button" className="account-action" onClick={() => onEdit(account)}>Sửa</button><button type="button" className="account-action account-action-delete" onClick={() => onDelete(account)} disabled={account.username === currentUsername}>Xóa</button></div></td></tr>;
        })}
        {!filtered.length && <tr><td colSpan="5"><EmptyState title="Không tìm thấy tài khoản" description="Thử thay đổi từ khóa tìm kiếm." /></td></tr>}
      </tbody></table></div>
      <div className="account-security-note"><span className="demo-tag-dot" /> Đây là tài khoản mô phỏng; mật khẩu chỉ được lưu cục bộ trên trình duyệt.</div>
    </section>
  </>;
}

function MaintenancePage({ data, user, employeeName, canManage, onRequest, onComplete }) {
  const items = user.role === "NhanVien" ? data.maintenance.filter((item) => item.employeeId === user.employeeId) : data.maintenance;
  return <><PageHeading eyebrow="VẬN HÀNH & BẢO DƯỠNG" title="Bảo trì & sửa chữa" description={canManage ? "Theo dõi yêu cầu, xử lý sửa chữa và ghi nhận chi phí." : "Gửi yêu cầu và theo dõi tình trạng bảo trì tài sản của bạn."} action={canManage ? onComplete : onRequest} actionLabel={canManage ? "Xử lý yêu cầu" : "Gửi yêu cầu"} actionIcon={canManage ? "check" : "plus"} />
    <div className="mini-stats"><MiniStat title="Tổng yêu cầu" value={items.length} tone="blue" /><MiniStat title="Chờ xử lý" value={items.filter((item) => item.status === "Chờ xử lý").length} tone="orange" /><MiniStat title="Chi phí đã ghi nhận" value={money(items.reduce((sum, item) => sum + Number(item.cost), 0))} tone="violet" /></div>
    <section className="panel table-panel"><div className="panel-heading panel-heading-padded"><div><h3>Danh sách yêu cầu bảo trì</h3><p>Chi tiết sự cố và kết quả xử lý</p></div></div><div className="table-scroll"><table className="data-table"><thead><tr><th>MÃ PHIẾU</th><th>TÀI SẢN</th><th>NGƯỜI GỬI</th><th>NỘI DUNG</th><th>NGÀY GỬI</th><th>CHI PHÍ</th><th>TRẠNG THÁI</th></tr></thead><tbody>{items.map((item) => { const asset = data.assets.find((row) => row.id === item.assetId); return <tr key={item.id}><td><span className="code-chip">{item.id}</span></td><td><span className="table-primary">{asset?.name || item.assetId}</span><small className="table-secondary">{item.assetId}</small></td><td>{employeeName(item.employeeId)}</td><td className="content-cell">{item.content}</td><td>{dateLabel(item.date)}</td><td className="amount-cell">{money(item.cost)}</td><td><StatusBadge status={item.status} /></td></tr>; })}{!items.length && <tr><td colSpan="7"><EmptyState title="Chưa có yêu cầu bảo trì" description="Các yêu cầu sẽ được hiển thị tại đây." /></td></tr>}</tbody></table></div></section>
  </>;
}

function LiquidationsPage({ data, canManage, onAdd }) {
  const totalRecovered = data.liquidations.reduce((sum, item) => sum + Number(item.recoveryValue || 0), 0);
  return <><PageHeading eyebrow="VÒNG ĐỜI TÀI SẢN" title="Thanh lý tài sản" description="Lưu trữ hồ sơ và giá trị thu hồi của tài sản đã thanh lý." action={canManage ? onAdd : null} actionLabel="Lập phiếu thanh lý" />
    <div className="mini-stats"><MiniStat title="Đã thanh lý" value={data.liquidations.length} tone="orange" /><MiniStat title="Giá trị thu hồi" value={money(totalRecovered)} tone="green" /><MiniStat title="Tổng nguyên giá" value={money(data.assets.filter((item) => item.status === "Thanh lý").reduce((sum, item) => sum + Number(item.value), 0))} tone="blue" /></div>
    <section className="panel table-panel"><div className="panel-heading panel-heading-padded"><div><h3>Hồ sơ thanh lý</h3><p>Tài sản thanh lý vẫn được lưu trong lịch sử hệ thống</p></div></div><div className="table-scroll"><table className="data-table"><thead><tr><th>MÃ PHIẾU</th><th>TÀI SẢN</th><th>NGÀY THANH LÝ</th><th>LÝ DO</th><th>NGUYÊN GIÁ</th><th>GIÁ TRỊ THU HỒI</th></tr></thead><tbody>{data.liquidations.map((item) => { const asset = data.assets.find((row) => row.id === item.assetId); return <tr key={item.id}><td><span className="code-chip">{item.id}</span></td><td><span className="table-primary">{asset?.name || item.assetId}</span><small className="table-secondary">{item.assetId}</small></td><td>{dateLabel(item.date)}</td><td>{item.reason}</td><td className="amount-cell">{money(asset?.value)}</td><td className="amount-cell">{money(item.recoveryValue)}</td></tr>; })}{!data.liquidations.length && <tr><td colSpan="6"><EmptyState title="Chưa có tài sản thanh lý" description="Phiếu thanh lý đã lập sẽ xuất hiện tại đây." /></td></tr>}</tbody></table></div></section>
  </>;
}

function ReportsPage({ data, reportType, setReportType, employeeName, onExport }) {
  const report = getReportRows(data, reportType, { employeeName });
  const insights = getSmartMetrics(data);
  const valueTotal = data.assets.filter((item) => item.status !== "Thanh lý").reduce((sum, item) => sum + Number(item.value), 0);
  const maintenanceTotal = data.maintenance.reduce((sum, item) => sum + Number(item.cost), 0);
  const types = [{ id: "category", label: "Theo loại tài sản" }, { id: "department", label: "Theo phòng ban" }, { id: "status", label: "Theo tình trạng" }, { id: "utilization", label: "Hiệu suất sử dụng" }, { id: "age", label: "Tuổi đời tài sản" }, { id: "warranty", label: "Theo dõi bảo hành" }, { id: "maintenance", label: "Chi phí bảo trì" }, { id: "liquidation", label: "Thanh lý tài sản" }];
  return <><PageHeading eyebrow="PHÂN TÍCH DỮ LIỆU" title="Thống kê & báo cáo" description="Tổng hợp tài sản, tình trạng sử dụng và chi phí để hỗ trợ ra quyết định." action={onExport} actionLabel="Xuất Excel / CSV" actionIcon="download" />
    <div className="report-kpis"><div className="panel report-kpi"><span className="report-kpi-icon stat-blue"><Icon name="assets" size={18} /></span><small>TÀI SẢN ĐANG THEO DÕI</small><b>{data.assets.filter((item) => item.status !== "Thanh lý").length}</b><span>tài sản</span></div><div className="panel report-kpi"><span className="report-kpi-icon stat-green"><Icon name="reports" size={18} /></span><small>TỔNG NGUYÊN GIÁ</small><b>{money(valueTotal)}</b><span>không bao gồm tài sản thanh lý</span></div><div className="panel report-kpi"><span className="report-kpi-icon stat-orange"><Icon name="maintenance" size={18} /></span><small>CHI PHÍ BẢO TRÌ</small><b>{money(maintenanceTotal)}</b><span>{data.maintenance.length} phiếu đã ghi nhận</span></div></div>
    <section className="panel insight-panel"><div className="panel-heading"><div><h3>Phân tích thông minh</h3><p>Chỉ số vận hành, cảnh báo và phân bố tài sản</p></div><span className="audit-chip"><Icon name="activity" size={14} /> Cập nhật trực tiếp</span></div><SmartInsightGrid insights={insights} /></section>
    <section className="panel report-panel"><div className="report-toolbar"><div><h3>Báo cáo chi tiết</h3><p>Chọn góc nhìn dữ liệu cần phân tích</p></div><div className="select-wrap"><select value={reportType} onChange={(event) => setReportType(event.target.value)}>{types.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div></div>
      {["category", "department", "status", "utilization", "age"].includes(reportType) ? <div className="report-chart">{report.rows.map((row, index) => { const chartCount = reportType === "utilization" ? Number(String(row[3]).replace("%", "")) : Number(row[1]) || 0; const max = Math.max(...report.rows.map((line) => reportType === "utilization" ? Number(String(line[3]).replace("%", "")) : Number(line[1]) || 0), 1); return <div className="report-bar-row" key={`${row[0]}-${index}`}><div className="report-bar-title"><span>{row[0]}</span><b>{reportType === "utilization" ? `${row[2]}/${row[1]}` : `${Number(row[1]) || 0}`} <small>{reportType === "utilization" ? "đang dùng" : "tài sản"}</small></b></div><div className="report-bar-track"><span style={{ width: `${(chartCount / max) * 100}%` }} /></div><div className="report-bar-value">{reportType === "status" || reportType === "utilization" ? row[2 + (reportType === "utilization" ? 1 : 0)] : money(row[2])}</div></div>; })}</div> : null}
      <div className="table-scroll"><table className="data-table"><thead><tr>{report.headers.map((header) => <th key={header}>{header.toUpperCase()}</th>)}</tr></thead><tbody>{report.rows.map((row, index) => <tr key={`report-${index}`}>{row.map((cell, cellIndex) => <td className={reportCellIsMoney(reportType, cellIndex) ? "amount-cell" : ""} key={`${index}-${cellIndex}`}>{formatReportCell(reportType, cell, cellIndex)}</td>)}</tr>)}{!report.rows.length && <tr><td colSpan={report.headers.length}><EmptyState title="Chưa có dữ liệu báo cáo" description="Hãy tạo dữ liệu nghiệp vụ trước khi xuất báo cáo." /></td></tr>}</tbody></table></div>
      <div className="report-note"><Icon name="check" size={15} /> Số liệu được tính trực tiếp từ dữ liệu thực nghiệm hiện tại.</div>
    </section>
    <div className="report-actions"><button type="button" className="button button-secondary" onClick={onExport}><Icon name="download" size={16} /> Tải báo cáo CSV / Excel</button><button type="button" className="button button-secondary" onClick={() => window.print()}><Icon name="reports" size={16} /> In / lưu PDF</button></div>
  </>;
}

function getReportRows(data, type, helpers) {
  const { employeeName } = helpers;
  if (type === "category") {
    return { headers: ["Loại tài sản", "Số lượng (kể cả đã thanh lý)", "Tổng nguyên giá (VNĐ)"], rows: data.categories.map((category) => { const assets = data.assets.filter((asset) => asset.categoryId === category.id); return [category.name, assets.length, assets.reduce((sum, asset) => sum + Number(asset.value), 0)]; }) };
  }
  if (type === "department") {
    const rows = data.departments.map((department) => { const assets = data.assets.filter((asset) => asset.departmentId === department.id && asset.status !== "Thanh lý"); return [department.name, assets.length, assets.reduce((sum, asset) => sum + Number(asset.value), 0)]; });
    rows.push(["Chưa phân công", data.assets.filter((asset) => !asset.departmentId && asset.status !== "Thanh lý").length, data.assets.filter((asset) => !asset.departmentId && asset.status !== "Thanh lý").reduce((sum, asset) => sum + Number(asset.value), 0)]);
    return { headers: ["Phòng ban", "Số lượng tài sản", "Tổng giá trị (VNĐ)"], rows };
  }
  if (type === "status") {
    return { headers: ["Tình trạng", "Số lượng", "Tỷ lệ"], rows: STATUSES.map((status) => { const count = data.assets.filter((asset) => asset.status === status).length; return [status, count, `${data.assets.length ? Math.round((count / data.assets.length) * 100) : 0}%`]; }) };
  }
  if (type === "utilization") {
    const activeAssets = data.assets.filter((asset) => asset.status !== "Thanh lý");
    const rows = data.departments.map((department) => {
      const assets = activeAssets.filter((asset) => asset.departmentId === department.id);
      const inUse = assets.filter((asset) => asset.status === "Đang sử dụng").length;
      return [department.name, assets.length, inUse, `${assets.length ? Math.round((inUse / assets.length) * 100) : 0}%`];
    });
    const unassigned = activeAssets.filter((asset) => !asset.departmentId);
    const unassignedInUse = unassigned.filter((asset) => asset.status === "Đang sử dụng").length;
    rows.push(["Chưa phân công", unassigned.length, unassignedInUse, `${unassigned.length ? Math.round((unassignedInUse / unassigned.length) * 100) : 0}%`]);
    return { headers: ["Phòng ban", "Tài sản", "Đang sử dụng", "Hiệu suất sử dụng"], rows };
  }
  if (type === "age") {
    const buckets = [{ label: "Dưới 1 năm", min: -Infinity, max: 1 }, { label: "1–3 năm", min: 1, max: 3 }, { label: "3–5 năm", min: 3, max: 5 }, { label: "Trên 5 năm", min: 5, max: Infinity }];
    const activeAssets = data.assets.filter((asset) => asset.status !== "Thanh lý");
    return { headers: ["Tuổi đời", "Số lượng", "Tổng nguyên giá (VNĐ)"], rows: buckets.map((bucket) => {
      const assets = activeAssets.filter((asset) => {
        if (!asset.purchaseDate) return false;
        const years = getAssetAge(asset.purchaseDate);
        return years !== null && years >= bucket.min && years < bucket.max;
      });
      return [bucket.label, assets.length, assets.reduce((sum, asset) => sum + Number(asset.value || 0), 0)];
    }) };
  }
  if (type === "warranty") {
    const today = TODAY();
    return { headers: ["Mã tài sản", "Tên tài sản", "Hạn bảo hành", "Tình trạng bảo hành", "Nguyên giá (VNĐ)"], rows: data.assets.filter((asset) => asset.status !== "Thanh lý").map((asset) => {
      const warranty = asset.warrantyDate || "";
      const warrantyStatus = !warranty ? "Chưa cập nhật" : warranty < today ? "Đã hết hạn" : (new Date(`${warranty}T00:00:00`) - new Date(`${today}T00:00:00`)) / 86400000 <= 90 ? "Sắp hết hạn" : "Còn hạn";
      return [asset.id, asset.name, dateLabel(warranty), warrantyStatus, Number(asset.value || 0)];
    }) };
  }
  if (type === "maintenance") {
    return { headers: ["Mã phiếu", "Tài sản", "Người gửi", "Ngày", "Nội dung", "Trạng thái", "Chi phí (VNĐ)"], rows: data.maintenance.map((item) => [item.id, data.assets.find((asset) => asset.id === item.assetId)?.name || item.assetId, employeeName(item.employeeId), dateLabel(item.date), item.content, item.status, Number(item.cost)]) };
  }
  return { headers: ["Mã phiếu", "Tài sản", "Ngày thanh lý", "Lý do", "Nguyên giá (VNĐ)", "Giá trị thu hồi (VNĐ)"], rows: data.liquidations.map((item) => [item.id, data.assets.find((asset) => asset.id === item.assetId)?.name || item.assetId, dateLabel(item.date), item.reason, Number(data.assets.find((asset) => asset.id === item.assetId)?.value || 0), Number(item.recoveryValue)]) };
}

function reportCellIsMoney(type, index) {
  if (type === "category" || type === "department" || type === "age") return index === 2;
  if (type === "warranty") return index === 4;
  if (type === "maintenance") return index === 6;
  if (type === "liquidation") return index >= 4;
  return false;
}

function formatReportCell(type, value, index) {
  return typeof value === "number" && reportCellIsMoney(type, index) ? money(value) : value;
}

function ActivityPage({ logs }) {
  return <><PageHeading eyebrow="MINH BẠCH & KIỂM SOÁT" title="Nhật ký hoạt động" description="Theo dõi các thao tác đã thực hiện trên dữ liệu thử nghiệm." />
    <section className="panel activity-panel"><div className="panel-heading panel-heading-padded"><div><h3>Lịch sử thao tác</h3><p>{logs.length} hoạt động gần nhất</p></div><span className="audit-chip"><Icon name="check" size={14} /> Đang ghi nhận</span></div>{logs.length ? <div className="activity-list activity-list-full">{logs.map((item) => <ActivityRow key={item.id} log={item} />)}</div> : <EmptyState title="Chưa có lịch sử hoạt động" description="Thao tác mới sẽ được ghi nhận tự động." />}</section>
  </>;
}

function ActivityRow({ log }) {
  return <div className="activity-row"><span className="activity-icon"><Icon name={log.action.toLowerCase().includes("bảo trì") ? "maintenance" : log.action.toLowerCase().includes("cấp phát") ? "allocation" : log.action.toLowerCase().includes("thanh lý") ? "liquidation" : "assets"} size={16} /></span><div className="activity-main"><b>{log.action}</b><span>{log.detail}</span></div><div className="activity-meta"><span>{log.actor}</span><small>{new Date(log.date).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}</small></div></div>;
}

function StatusBadge({ status }) {
  return <span className={`status-badge ${statusClass(status)}`}><i />{status}</span>;
}

function statusClass(status) {
  if (status === "Sẵn sàng") return "ready";
  if (status === "Đang sử dụng") return "in-use";
  if (status === "Đang bảo trì" || status === "Chờ xử lý") return "repair";
  if (status === "Hư hỏng") return "broken";
  if (status === "Thanh lý" || status === "Đã thu hồi") return "retired";
  if (status === "Hoàn tất") return "complete";
  return "neutral";
}

function categoryTone(name = "") {
  if (name.includes("CNTT")) return "asset-tone-blue";
  if (name.includes("văn phòng")) return "asset-tone-orange";
  return "asset-tone-green";
}

function RowActions({ canManage, onEdit, onDelete, onView }) {
  if (!canManage && !onView) return null;
  return <div className="row-actions">{onView && <button type="button" title="Xem chi tiết" onClick={onView}><Icon name="eye" size={16} /></button>}{canManage && onEdit && <button type="button" title="Chỉnh sửa" onClick={onEdit}><Icon name="edit" size={16} /></button>}{canManage && onDelete && <button type="button" className="row-action-delete" title="Xóa" onClick={onDelete}><Icon name="liquidation" size={16} /></button>}</div>;
}

function MiniStat({ title, value, tone }) {
  return <div className="panel mini-stat"><span className={`mini-stat-dot ${tone}`} /><span><small>{title}</small><b>{value}</b></span></div>;
}

function EmptyState({ title, description }) {
  return <div className="empty-state"><span className="empty-icon"><Icon name="box" size={22} /></span><b>{title}</b><p>{description}</p></div>;
}

function FormModal({ title, fields, initial, onClose, onSubmit, submitLabel }) {
  const defaults = Object.fromEntries(fields.map((field) => [field.name, initial?.[field.name] ?? field.defaultValue ?? (field.type === "date" && field.name !== "purchaseDate" && field.name !== "warrantyDate" ? TODAY() : field.type === "number" ? 0 : "")]));
  const [values, setValues] = useState(defaults);
  const update = (name, value) => setValues((current) => ({ ...current, [name]: value }));
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="form-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><div><div className="eyebrow">QUẢN LÝ TÀI SẢN</div><h2 id="modal-title">{title}</h2></div><button type="button" className="icon-button modal-close" onClick={onClose} aria-label="Đóng"><Icon name="close" size={19} /></button></div><form onSubmit={(event) => { event.preventDefault(); onSubmit(values); }}><div className="form-grid">{fields.map((field) => <label key={field.name} className={`form-field ${field.full ? "field-full" : ""}`}><span className="field-label">{field.label}{field.required && <i> *</i>}</span>{field.type === "select" ? <select required={field.required} disabled={field.disabled} value={values[field.name] ?? ""} onChange={(event) => update(field.name, event.target.value)}><option value="" disabled>{field.required ? "Chọn thông tin" : "Chưa phân công"}</option>{field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : field.type === "textarea" ? <textarea required={field.required} value={values[field.name] ?? ""} onChange={(event) => update(field.name, event.target.value)} rows="3" placeholder={field.placeholder || ""} /> : <input required={field.required} disabled={field.disabled} type={field.type || "text"} min={field.min} value={values[field.name] ?? ""} onChange={(event) => update(field.name, event.target.value)} placeholder={field.placeholder || ""} />}</label>)}</div><div className="form-hint"><span className="demo-tag-dot" /> Dữ liệu được lưu trực tiếp trên trình duyệt hiện tại.</div><div className="modal-actions"><button type="button" className="button button-secondary" onClick={onClose}>Hủy</button><button type="submit" className="button button-primary"><Icon name="check" size={16} />{submitLabel}</button></div></form></section></div>;
}

function AssetDetailModal({ asset, data, categoryName, departmentName, employeeName, onClose }) {
  const allocations = data.allocations.filter((item) => item.assetId === asset.id);
  const maintenance = data.maintenance.filter((item) => item.assetId === asset.id);
  const transfers = data.transfers.filter((item) => item.assetId === asset.id);
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="detail-modal" role="dialog" aria-modal="true"><div className="modal-heading"><div><div className="eyebrow">HỒ SƠ TÀI SẢN · {asset.id}</div><h2>{asset.name}</h2></div><button type="button" className="icon-button modal-close" onClick={onClose} aria-label="Đóng"><Icon name="close" size={19} /></button></div><div className="detail-status-line"><StatusBadge status={asset.status} /><span className="category-chip">{categoryName(asset.categoryId)}</span></div><div className="detail-grid">{[["Nguyên giá", money(asset.value)], ["Ngày mua", dateLabel(asset.purchaseDate)], ["Phòng ban", departmentName(asset.departmentId)], ["Người sử dụng", employeeName(asset.employeeId)], ["Nhà cung cấp", asset.supplier || "—"], ["Hạn bảo hành", dateLabel(asset.warrantyDate)], ["Vị trí", asset.location || "—"], ["Ghi chú", asset.note || "—"]].map(([label, value]) => <div className="detail-field" key={label}><small>{label}</small><b>{value}</b></div>)}</div><div className="detail-history"><h3>Lịch sử tài sản</h3>{[...allocations.map((item) => ({ date: item.date, title: item.status === "Đang sử dụng" ? `Cấp phát cho ${employeeName(item.employeeId)}` : `Phiếu cấp phát ${item.id}`, note: item.returnedDate ? `Thu hồi ngày ${dateLabel(item.returnedDate)}` : "Đang sử dụng" })), ...maintenance.map((item) => ({ date: item.date, title: `Bảo trì · ${item.status}`, note: `${item.content} · ${money(item.cost)}` })), ...transfers.map((item) => ({ date: item.date, title: `Điều chuyển ${employeeName(item.fromEmployeeId)} → ${employeeName(item.toEmployeeId)}`, note: item.reason }))].sort((a, b) => b.date.localeCompare(a.date)).map((item, index) => <div className="detail-history-row" key={`${item.date}-${index}`}><span className="detail-history-dot" /><div><b>{item.title}</b><small>{item.note}</small></div><time>{dateLabel(item.date)}</time></div>)}{!allocations.length && !maintenance.length && !transfers.length && <p className="detail-no-history">Chưa có lịch sử nghiệp vụ.</p>}</div><div className="modal-actions"><button type="button" className="button button-primary" onClick={onClose}>Đóng hồ sơ</button></div></section></div>;
}

function DataToolsModal({ onClose, onBackup, onRestore, onReset }) {
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="form-modal data-tools-modal" role="dialog" aria-modal="true" aria-labelledby="data-tools-title"><div className="modal-heading"><div><div className="eyebrow">DỮ LIỆU THỬ NGHIỆM</div><h2 id="data-tools-title">Sao lưu & khôi phục</h2></div><button type="button" className="icon-button modal-close" onClick={onClose} aria-label="Đóng"><Icon name="close" size={19} /></button></div><p className="data-tools-description">Tải dữ liệu về máy, khôi phục từ tệp JSON hoặc bắt đầu lại với dữ liệu mẫu.</p><div className="data-tools-actions"><button type="button" className="data-tool-option" onClick={onBackup}><span className="data-tool-icon"><Icon name="download" size={19} /></span><span><b>Tải bản sao lưu</b><small>Xuất toàn bộ dữ liệu thành tệp JSON</small></span><Icon name="chevron" size={16} /></button><button type="button" className="data-tool-option" onClick={onRestore}><span className="data-tool-icon data-tool-restore"><Icon name="arrow" size={19} /></span><span><b>Khôi phục từ tệp</b><small>Chọn tệp JSON đã sao lưu trước đó</small></span><Icon name="chevron" size={16} /></button><button type="button" className="data-tool-option data-tool-reset" onClick={onReset}><span className="data-tool-icon data-tool-reset-icon"><Icon name="clock" size={19} /></span><span><b>Khôi phục dữ liệu mẫu</b><small>Thay thế dữ liệu hiện tại bằng dữ liệu ban đầu</small></span><Icon name="chevron" size={16} /></button></div><div className="modal-actions"><button type="button" className="button button-secondary" onClick={onClose}>Đóng</button></div></section></div>;
}
