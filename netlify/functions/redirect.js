exports.handler = async (event, context) => {
    // Lấy chuỗi sau dấu / (Ví dụ: /xem-tron-bo-1 -> pathParam = "xem-tron-bo-1")
    const pathParam = event.path.replace('/', '').trim();

    // =========================================================================
    // 💡 DANH SÁCH TẤT CẢ CÁC LINK CỦA BẠN NẰM Ở ĐÂY
    // Bạn muốn thêm bao nhiêu link chỉ cần copy ra rồi đổi tên key & link TikTok
    // =========================================================================
    const linkDatabase = {
        "xem-tron-bo-1": "https://vt.tiktok.com/ZS9rX1jo9U2y6-3hK3c/",
        "xem-tron-bo-2": "https://vt.tiktok.com/ZS9rCaJK1mMbc-qWNWf/",
        "xem-tron-bo-3": "https://vt.tiktok.com/ZS9rCKytwmwB2-aImD6/",
        "xem-tron-bo-x": "https://vt.tiktok.com/LINK_TIKTOK_SHOP_CUA_BAN/"
    };

    // Lấy link TikTok tương ứng với đường dẫn.
    // Nếu không tìm thấy thì mặc định lấy link xem-tron-bo-1
    const rawTiktokUrl = linkDatabase[pathParam] || linkDatabase["xem-tron-bo-1"];

    try {
        // 1. Server Netlify tự FETCH CHÌM để giải mã link ngắn -> link dài
        const response = await fetch(rawTiktokUrl, {
            method: 'GET',
            redirect: 'follow',
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
            }
        });

        const finalUrl = response.url;
        const encodedUrl = encodeURIComponent(finalUrl);

        // 2. Tạo Deep Link cho Android & iOS
        const androidIntent = `intent://dl/recommend?url=${encodedUrl}#Intent;package=com.zhiliaoapp.musically;scheme=snssdk1128;end;`;
        const iosScheme = `snssdk1128://webview?url=${encodedUrl}`;

        // 3. Trả về HTML đệm tự bật App TikTok
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Đang mở TikTok...</title>
            <script>
                window.onload = function() {
                    var userAgent = navigator.userAgent || navigator.vendor || window.opera;
                    var isAndroid = /android/i.test(userAgent);
                    var isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;

                    if (isAndroid) {
                        window.location.href = "${androidIntent}";
                    } else if (isIOS) {
                        var a = document.createElement('a');
                        a.href = "${iosScheme}";
                        a.rel = 'noreferrer';
                        document.body.appendChild(a);
                        a.click();
                    } else {
                        window.location.href = "${finalUrl}";
                    }

                    setTimeout(function() {
                        window.location.href = "${finalUrl}";
                    }, 2000);
                };
            </script>
        </head>
        <body style="background-color:#000; color:#fff; display:flex; justify-content:center; align-items:center; height:100vh; margin:0; font-family:sans-serif;">
            <p style="font-size: 14px;">Đang chuyển hướng sang ứng dụng TikTok...</p>
        </body>
        </html>
        `;

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            },
            body: htmlContent
        };

    } catch (error) {
        return {
            statusCode: 302,
            headers: {
                Location: rawTiktokUrl
            }
        };
    }
};