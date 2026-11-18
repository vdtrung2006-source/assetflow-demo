# AssetFlow — bản chạy thử quản lý tài sản

Giao diện React tiếng Việt được dựng theo dữ liệu và các ca nghiệp vụ trong báo cáo `BaoCao_QuanLyTaiSan_PTTKHT_Final.docx`. Đây là bản thực nghiệm chạy trên trình duyệt, không kết nối cơ sở dữ liệu hoặc hợp đồng Ethereum. Dữ liệu thay đổi được lưu trong `localStorage` của trình duyệt hiện tại.

## Chạy ứng dụng

```sh
cd frontend
npm install
npm start
```

Mở [http://localhost:3000](http://localhost:3000).

## Đưa bản chạy thử lên GitHub Pages

Repo đích mới là `vdtrung2006-source/assetflow-demo`. Sau khi tạo repo, đưa ứng dụng và workflow `.github/workflows/deploy-assetflow.yml` lên nhánh `main`; workflow sẽ build và phát hành trang. Bật **Settings → Pages → Build and deployment → Source: GitHub Actions** trong repo nếu GitHub yêu cầu cấu hình lần đầu.

URL dự kiến sau khi tạo repo và lần deploy đầu tiên thành công: [https://vdtrung2006-source.github.io/assetflow-demo/](https://vdtrung2006-source.github.io/assetflow-demo/).

## Tài khoản trải nghiệm

| Vai trò | Tên đăng nhập | Mật khẩu |
| --- | --- | --- |
| Quản trị viên | `admin` | `admin123` |
| Ban lãnh đạo | `lanhdao` | `123456` |
| Nhân viên (NV03) | `nv03` | `123456` |

Đây là thông tin đăng nhập mô phỏng để thử phân quyền, không dùng cho môi trường thật.

## Chức năng

- Tổng quan số liệu, trạng thái tài sản, chi phí bảo trì và nhật ký hoạt động.
- Tìm kiếm, lọc, xem hồ sơ và quản lý tài sản, danh mục, phòng ban, nhân viên.
- Cấp phát, thu hồi, điều chuyển tài sản; tạo và hoàn tất yêu cầu bảo trì; lập phiếu thanh lý.
- Quản lý tài khoản trải nghiệm: tạo, sửa vai trò, đổi mật khẩu, khóa/mở khóa và xóa có kiểm tra tài khoản quản trị cuối cùng.
- Báo cáo theo loại tài sản, phòng ban, tình trạng, hiệu suất sử dụng, tuổi đời, bảo hành, chi phí bảo trì và thanh lý; xuất CSV mở bằng Excel hoặc in/lưu thành PDF.
- Chỉ số thông minh: tỷ lệ sử dụng, bảo hành hết hạn/sắp hết hạn, tài sản cần chú ý, tuổi đời trung bình, phòng ban có nguyên giá cao nhất và tỷ lệ chi phí bảo trì.
- Phân quyền giao diện theo Admin, Nhân viên và Ban lãnh đạo.
- Tự động lưu dữ liệu; tải bản sao lưu JSON, khôi phục từ JSON hoặc đặt lại dữ liệu mẫu.

## Dữ liệu mẫu và giới hạn

Dữ liệu ban đầu gồm 4 tài khoản mẫu (trong đó có một tài khoản khóa), 3 phòng ban, 5 nhân viên, 3 danh mục, 9 tài sản cùng lịch sử cấp phát, điều chuyển, bảo trì và thanh lý, dựa trên phần thực nghiệm trong báo cáo. Tài khoản kiểm tra bị khóa là `locked` / `123456`. Tài khoản mới và mọi thay đổi chỉ được lưu trên trình duyệt hiện tại. Mật khẩu lưu cục bộ dưới dạng mô phỏng; đăng nhập và phân quyền không thay thế xác thực an toàn phía máy chủ, không dùng cho môi trường thật. Các chức năng blockchain trong boilerplate không được sử dụng cho ứng dụng quản lý tài sản này.
