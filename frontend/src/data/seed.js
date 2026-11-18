export const STORAGE_KEY = "quan-ly-tai-san-demo-v1";

export function createInitialData() {
  return {
    accounts: [
      { id: "TK001", username: "admin", password: "admin123", role: "Admin", name: "Quản trị viên", employeeId: "", active: true },
      { id: "TK002", username: "lanhdao", password: "123456", role: "BanLanhDao", name: "Ban lãnh đạo", employeeId: "NV05", active: true },
      { id: "TK003", username: "nv03", password: "123456", role: "NhanVien", name: "Lê Văn Cường", employeeId: "NV03", active: true },
      { id: "TK004", username: "locked", password: "123456", role: "NhanVien", name: "Tài khoản bị khóa", employeeId: "NV02", active: false },
    ],
    departments: [
      { id: "PB01", name: "Phòng Hành chính", lead: "Nguyễn Văn An", phone: "0225 382 1001", email: "hanhchinh@donvi.vn", description: "Quản lý hành chính và cơ sở vật chất" },
      { id: "PB02", name: "Phòng Kế toán", lead: "Hoàng Văn Em", phone: "0225 382 1002", email: "ketoan@donvi.vn", description: "Tài chính và kế toán" },
      { id: "PB03", name: "Phòng Kỹ thuật", lead: "Lê Văn Cường", phone: "0225 382 1003", email: "kythuat@donvi.vn", description: "Hạ tầng và hỗ trợ kỹ thuật" },
    ],
    categories: [
      { id: "LTS01", name: "Thiết bị CNTT", description: "Máy tính, máy chủ và thiết bị mạng" },
      { id: "LTS02", name: "Thiết bị văn phòng", description: "Máy in, máy chiếu và thiết bị văn phòng" },
      { id: "LTS03", name: "Nội thất", description: "Bàn ghế, tủ và nội thất làm việc" },
    ],
    employees: [
      { id: "NV01", name: "Nguyễn Văn An", title: "Trưởng phòng", departmentId: "PB01", email: "an.nguyen@donvi.vn", phone: "0901 234 501", birthDate: "1985-04-12" },
      { id: "NV02", name: "Trần Thị Bình", title: "Kế toán", departmentId: "PB02", email: "binh.tran@donvi.vn", phone: "0901 234 502", birthDate: "1990-08-21" },
      { id: "NV03", name: "Lê Văn Cường", title: "Kỹ thuật viên", departmentId: "PB03", email: "cuong.le@donvi.vn", phone: "0901 234 503", birthDate: "1992-03-16" },
      { id: "NV04", name: "Phạm Thị Dung", title: "Nhân viên", departmentId: "PB01", email: "dung.pham@donvi.vn", phone: "0901 234 504", birthDate: "1995-11-02" },
      { id: "NV05", name: "Hoàng Văn Em", title: "Giám đốc", departmentId: "PB02", email: "em.hoang@donvi.vn", phone: "0901 234 505", birthDate: "1978-07-09" },
    ],
    assets: [
      { id: "TS001", name: "Máy tính Dell Optiplex", categoryId: "LTS01", purchaseDate: "2024-06-15", value: 15000000, supplier: "Dell Việt Nam", status: "Đang sử dụng", departmentId: "PB01", employeeId: "NV04", warrantyDate: "2027-06-15", location: "Phòng Hành chính", note: "Điều chuyển từ NV03 sang NV04" },
      { id: "TS002", name: "Máy in HP LaserJet", categoryId: "LTS02", purchaseDate: "2023-10-10", value: 6500000, supplier: "HP Việt Nam", status: "Sẵn sàng", departmentId: "", employeeId: "", warrantyDate: "2025-10-10", location: "Kho thiết bị", note: "" },
      { id: "TS003", name: "Bàn làm việc", categoryId: "LTS03", purchaseDate: "2024-01-20", value: 2500000, supplier: "Nội thất Hòa Phát", status: "Sẵn sàng", departmentId: "", employeeId: "", warrantyDate: "2026-01-20", location: "Kho thiết bị", note: "" },
      { id: "TS004", name: "Máy chiếu Epson", categoryId: "LTS02", purchaseDate: "2023-08-05", value: 12000000, supplier: "Epson Việt Nam", status: "Sẵn sàng", departmentId: "", employeeId: "", warrantyDate: "2026-08-05", location: "Kho thiết bị", note: "Đã thu hồi sau sử dụng" },
      { id: "TS005", name: "Laptop Lenovo ThinkPad", categoryId: "LTS01", purchaseDate: "2024-09-01", value: 18500000, supplier: "Lenovo Việt Nam", status: "Đang sử dụng", departmentId: "PB03", employeeId: "NV03", warrantyDate: "2027-09-01", location: "Phòng Kỹ thuật", note: "Đã bảo trì, chi phí 850.000đ" },
      { id: "TS006", name: "Tủ hồ sơ", categoryId: "LTS03", purchaseDate: "2022-05-22", value: 3200000, supplier: "Nội thất Hòa Phát", status: "Sẵn sàng", departmentId: "", employeeId: "", warrantyDate: "2024-05-22", location: "Kho thiết bị", note: "" },
      { id: "TS007", name: "Điều hòa Daikin", categoryId: "LTS02", purchaseDate: "2021-04-12", value: 11000000, supplier: "Daikin Việt Nam", status: "Thanh lý", departmentId: "", employeeId: "", warrantyDate: "2024-04-12", location: "Đã thanh lý", note: "Thanh lý theo kịch bản thực nghiệm" },
      { id: "TS008", name: "Máy chủ Dell PowerEdge", categoryId: "LTS01", purchaseDate: "2025-02-14", value: 45000000, supplier: "Dell Việt Nam", status: "Sẵn sàng", departmentId: "", employeeId: "", warrantyDate: "2028-02-14", location: "Kho thiết bị", note: "" },
      { id: "TS009", name: "Máy quét Canon DR-C240", categoryId: "LTS02", purchaseDate: "2025-05-18", value: 8500000, supplier: "Canon Việt Nam", status: "Sẵn sàng", departmentId: "", employeeId: "", warrantyDate: "2027-05-18", location: "Kho thiết bị", note: "Tài sản bổ sung trong kịch bản thử nghiệm" },
    ],
    allocations: [
      { id: "CP001", assetId: "TS001", employeeId: "NV03", departmentId: "PB03", date: "2025-01-08", returnedDate: "2025-06-02", status: "Đã thu hồi", handover: "Nguyễn Văn An" },
      { id: "CP002", assetId: "TS001", employeeId: "NV04", departmentId: "PB01", date: "2025-06-02", returnedDate: "", status: "Đang sử dụng", handover: "Nguyễn Văn An" },
      { id: "CP003", assetId: "TS005", employeeId: "NV03", departmentId: "PB03", date: "2025-02-16", returnedDate: "", status: "Đang sử dụng", handover: "Nguyễn Văn An" },
    ],
    transfers: [
      { id: "DC001", assetId: "TS001", fromEmployeeId: "NV03", fromDepartmentId: "PB03", toEmployeeId: "NV04", toDepartmentId: "PB01", date: "2025-06-02", reason: "Điều chuyển theo nhu cầu công việc" },
    ],
    maintenance: [
      { id: "BT001", assetId: "TS005", employeeId: "NV03", date: "2025-11-17", content: "Bảo trì định kỳ, vệ sinh và kiểm tra máy", cost: 850000, status: "Hoàn tất" },
    ],
    liquidations: [
      { id: "TL001", assetId: "TS007", date: "2025-11-17", reason: "Thiết bị cũ, hiệu suất thấp", recoveryValue: 1500000 },
    ],
    logs: [
      { id: "LG001", date: "2025-11-17T09:10:00.000Z", actor: "Admin", action: "Hoàn tất bảo trì", detail: "Laptop Lenovo ThinkPad · Chi phí 850.000đ" },
      { id: "LG002", date: "2025-11-17T08:30:00.000Z", actor: "Admin", action: "Thanh lý tài sản", detail: "Điều hòa Daikin · Phiếu TL001" },
      { id: "LG003", date: "2025-06-02T08:30:00.000Z", actor: "Admin", action: "Điều chuyển tài sản", detail: "Máy tính Dell Optiplex · Phiếu DC001" },
      { id: "LG004", date: "2025-02-16T08:00:00.000Z", actor: "Admin", action: "Cấp phát tài sản", detail: "Laptop Lenovo ThinkPad · Lê Văn Cường" },
    ],
  };
}
