import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "th",
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },

    resources: {
      en: {
        translation: {
          // --- General ---
          discover_products: "Discover the Right Products for You",
          sub_discover_products:
            "Feel free to explore our selection of quality products!",
          all_products: "All Products",
          recommended_products: "Recommended",
          add_to_cart: "Add to Cart",
          search_products: "Search Products",
          search_placeholder: "Type the product you are looking for...",
          search_prompt: "Please type to search for products...",
          no_results_found: 'No products found for "{{term}}"',
          search_error: "An error occurred during the search",
          search: "Search",
          baht: "THB",
          Recommended_Products: "Recommended Products",
          All: "All",
          Search_results_for: "Search results for:",
          clear: "Clear",
          no_product_found: "No products found",

          // --- Navigation ---
          nav_home: "Home",
          nav_cart: "Cart",
          nav_location: "Location",
          nav_profile: "My Profile",

          // --- Cart Page ---
          cart_title: "Shopping Cart",
          login_to_view_cart: "Please log in to view your shopping cart",
          go_to_login: "Go to Login Page",
          cart_is_empty: "Your shopping cart is empty",
          continue_shopping_prompt: "Start shopping to add items to your cart",
          back_to_shop: "Back to Shop",
          unavailable_items_warning:
            "Some items in your cart are unavailable and will not be included in the total.",
          no_available_items: "No available items in your cart.",
          unavailable_items: "Unavailable Items",
          price: "Price",
          quantity: "Quantity",
          item_unavailable: "Unavailable",
          remove: "Remove",
          summary: "Summary",
          subtotal: "Subtotal",
          shipping: "Shipping",
          free: "Free",
          total: "Total",
          proceed_to_checkout: "Proceed to Checkout",
          confirm_remove_item:
            "Are you sure you want to remove this item from your cart?",
          no_items_for_checkout:
            "There are no available items in your cart to check out.",
          update_quantity_fail: "Failed to update item quantity.",
          remove_item_fail: "Failed to remove item.",
          fetch_cart_fail: "Error fetching cart data.",
          login_prompt_cart: "Please log in to view your cart.",

          // --- Location Page ---
          storefront_alt: "Storefront",
          address_label: "Address",
          phone_label: "Phone",
          email_label: "Email",
          navigate_button: "Navigate",

          // --- Product Detail Page ---
          product_not_found: "Product not found or an error occurred",
          please_select_option: "Please select an option",
          please_select: "Please select",
          added_to_cart_success_title: "Success!",
          added_to_cart_success_body:
            'Added "{{productName}}" (x{{quantity}}) to your cart.',
          add_to_cart_fail_title: "Error",
          add_to_cart_fail_body:
            "Failed to add item to cart. Please try again.",
          quantity_label: "Quantity:",
          go_to_cart: "Go to Cart",
          back_button: "Back",
          buy_now: "Buy Now",
          add_to_cart_mobile: "Add to Cart",
          ok: "OK",

          // --- Profile Page ---
          loading_or_login_prompt: "Loading data or please log in",
          points: "Points",
          edit_profile: "Edit Profile",
          order_history: "Order History",
          help_center: "Help Center",
          logout: "Logout",

          // --- Checkout Page ---
          checkout_title: "Checkout",
          shipping_info: "Shipping Information",
          edit: "Edit",
          recipient_name: "Recipient's Name",
          phone_number: "Phone Number",
          address: "Address",
          save: "Save",
          cancel: "Cancel",
          order_summary: "Order Summary",
          items_list: "Items List",
          discount: "Discount",
          total_amount: "Total Amount",
          confirm_order: "Confirm Order",
          no_items_in_order: "No items in the order",
          back_to_cart: "Back to Cart",
          save_address_first:
            "Please save your address before placing an order.",
          fill_shipping_info: "Please complete the shipping information.",
          save_address_fail: "Failed to save address.",
          create_order_fail: "Failed to create order.",
          // --- Payment Confirmation Page ---
          payment_confirmation_title: "Payment Confirmation",
          order_number: "Order",
          amount_due: "Amount Due:",
          payment_instructions:
            "Please scan the QR Code below to pay, then attach the receipt to confirm.",
          qr_code_not_set: "The store has not set up a QR Code for payment.",
          attach_receipt: "Attach Payment Receipt",
          confirm_payment_button: "Confirm Payment",
          upload_receipt_prompt: "Please attach your payment receipt.",
          upload_success:
            "Receipt uploaded successfully! The store will verify it shortly.",
          upload_fail: "Failed to upload receipt. Please try again.",
          load_order_fail: "Could not load order details.",

          bank_name_label: "Bank",
          account_name_label: "Account Name",
          account_number_label: "Account Number",
          copy_button: "Copy",
          copied_button: "Copied!",

          // --- Login & Register Page ---
          login_title: "Login",
          username_label: "Username or Email",
          password_label: "Password",
          forgot_password: "Forgot password?",
          login_button: "Login",
          or_divider: "or",
          no_account_prompt: "Don't have an account?",
          create_account_link: "Create one",
          connect_server_fail: "Could not connect to the server",
          register_title: "Create New Account",
          register_button: "Register",
          already_have_account: "Already have an account?",
          login_link: "Login",
          password_required: "Password is required",
          password_min_length: "Password must be at least 6 characters long",
          register_success: "Registration successful! Redirecting to login...",
          register_fail: "Registration failed",

          // --- Landing Page ---
          skip_button: "Skip →",
          welcome_title: "Welcome",
          welcome_subtitle:
            "Get started by logging in or creating a new account.",

          // --- TopNavBar ---
          nav_language: "Language",
          nav_order_history: "Order History",
          nav_logout: "Logout",
          nav_hello: "Hello",
          nav_login: "Login",
          nav_register: "Register",
          search_placeholder_nav: "Search products...",

          // --- Hero Section ---
          hero_community_tag: "From Our Community to Your Home",
          hero_title: "Experience the Charm of the Lagoon",
          hero_subtitle: "Discover a variety of products from local wisdom, delivered directly to your home.",
          hero_cta_button: "Shop Now",
        },
      },
      th: {
        translation: {
          // --- General ---
          discover_products: "ค้นพบสินค้าที่ใช่สำหรับคุณ",
          sub_discover_products: "เลือกดูสินค้าคุณภาพจากร้านของเราได้เลย",
          all_products: "รายการสินค้า",
          recommended_products: "สินค้าแนะนำ",
          add_to_cart: "เพิ่มลงตะกร้า",
          search_products: "ค้นหาสินค้า",
          search_placeholder: "พิมพ์ชื่อสินค้าที่คุณต้องการค้นหา...",
          search_prompt: "กรุณาพิมพ์เพื่อค้นหาสินค้า...",
          no_results_found: 'ไม่พบสินค้าที่ตรงกับคำว่า "{{term}}"',
          search_error: "เกิดข้อผิดพลาดในการค้นหา",
          search: "ค้นหา",
          baht: "บาท",
          Recommended_Products: "สินค้าแนะนำ",
          All: "ทั้งหมด",
          Search_results_for: "ผลการค้นหาสำหรับ:",
          clear: "ล้างการค้นหา",
          no_product_found: "ไม่พบสินค้า",

          // --- Navigation ---
          nav_home: "หน้าแรก",
          nav_cart: "ตะกร้า",
          nav_location: "ที่อยู่",
          nav_profile: "โปรไฟล์",

          // --- Cart Page ---
          cart_title: "ตะกร้าสินค้า",
          login_to_view_cart: "กรุณาเข้าสู่ระบบเพื่อดูตะกร้าสินค้าของคุณ",
          go_to_login: "ไปที่หน้าเข้าสู่ระบบ",
          cart_is_empty: "ตะกร้าสินค้าของคุณว่างเปล่า",
          continue_shopping_prompt: "เลือกซื้อสินค้าเพื่อเพิ่มลงในตะกร้าได้เลย",
          back_to_shop: "กลับไปเลือกซื้อสินค้า",
          unavailable_items_warning:
            "มีสินค้าบางรายการในตะกร้าของคุณที่ไม่พร้อมจำหน่าย และจะไม่ถูกนำไปรวมในยอดชำระเงิน",
          no_available_items: "ไม่มีสินค้าที่พร้อมสั่งซื้อในตะกร้า",
          unavailable_items: "สินค้าที่ไม่พร้อมจำหน่าย",
          price: "ราคา",
          quantity: "จำนวน",
          item_unavailable: "ไม่สามารถสั่งซื้อได้",
          remove: "ลบออก",
          summary: "สรุปรายการ",
          subtotal: "ราคารวม (Subtotal)",
          shipping: "ค่าจัดส่ง",
          free: "ฟรี",
          total: "ยอดรวมทั้งสิ้น",
          proceed_to_checkout: "ไปที่หน้าชำระเงิน",
          confirm_remove_item: "คุณต้องการลบสินค้านี้ออกจากตะกร้าใช่หรือไม่?",
          no_items_for_checkout:
            "ไม่มีสินค้าที่สามารถสั่งซื้อได้ในตะกร้าของคุณ",
          update_quantity_fail: "ไม่สามารถอัปเดตจำนวนสินค้าได้",
          remove_item_fail: "ไม่สามารถลบสินค้าได้",
          fetch_cart_fail: "เกิดข้อผิดพลาดในการดึงข้อมูลตะกร้า",
          login_prompt_cart: "กรุณาเข้าสู่ระบบเพื่อดูตะกร้าสินค้า",

          // --- Location Page ---
          storefront_alt: "หน้าร้าน",
          address_label: "ที่อยู่",
          phone_label: "เบอร์โทรศัพท์",
          email_label: "อีเมล",
          navigate_button: "กดเพื่อนำทาง",

          // --- Product Detail Page ---
          product_not_found: "ไม่พบสินค้าหรือเกิดข้อผิดพลาด",
          please_select_option: "โปรดเลือกตัวเลือก",
          please_select: "กรุณาเลือก",
          added_to_cart_success_title: "เพิ่มสินค้าสำเร็จ",
          added_to_cart_success_body:
            'เพิ่ม "{{productName}}" จำนวน {{quantity}} ชิ้น ลงตะกร้าเรียบร้อยแล้ว',
          add_to_cart_fail_title: "เกิดข้อผิดพลาด",
          add_to_cart_fail_body:
            "ไม่สามารถเพิ่มสินค้าลงตะกร้าได้ โปรดลองอีกครั้ง",
          quantity_label: "จำนวน:",
          go_to_cart: "ไปที่ตะกร้า",
          back_button: "ย้อนกลับ",
          buy_now: "ซื้อทันที",
          add_to_cart_mobile: "เพิ่มลงตะกร้า",
          ok: "ตกลง",

          // --- Profile Page ---
          loading_or_login_prompt: "กำลังโหลดข้อมูล หรือ กรุณาเข้าสู่ระบบ",
          points: "แต้ม",
          edit_profile: "แก้ไขข้อมูลส่วนตัว",
          order_history: "ประวัติคำสั่งซื้อ",
          help_center: "ศูนย์ความช่วยเหลือ",
          logout: "ออกจากระบบ",

          // --- Checkout Page ---
          checkout_title: "สรุปคำสั่งซื้อ",
          shipping_info: "ข้อมูลการจัดส่ง",
          edit: "แก้ไข",
          recipient_name: "ชื่อผู้รับ",
          phone_number: "เบอร์โทรศัพท์",
          address: "ที่อยู่",
          save: "บันทึก",
          cancel: "ยกเลิก",
          order_summary: "สรุปยอดชำระเงิน",
          items_list: "รายการสินค้า",
          discount: "ส่วนลด",
          total_amount: "ยอดรวมทั้งสิ้น",
          confirm_order: "ยืนยันคำสั่งซื้อ",
          no_items_in_order: "ไม่มีสินค้าในตะกร้า",
          back_to_cart: "กลับไปที่ตะกร้าสินค้า",
          save_address_first: "กรุณาบันทึกที่อยู่ก่อนทำการสั่งซื้อ",
          fill_shipping_info: "กรุณากรอกข้อมูลการจัดส่งให้ครบถ้วน",
          save_address_fail: "ไม่สามารถบันทึกที่อยู่ได้",
          create_order_fail: "เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ",

          // --- Payment Confirmation Page ---
          payment_confirmation_title: "ยืนยันการชำระเงิน",
          order_number: "ออเดอร์หมายเลข",
          amount_due: "ยอดชำระ:",
          payment_instructions:
            "กรุณาสแกน QR Code ด้านล่างเพื่อชำระเงิน และแนบสลิปเพื่อยืนยัน",
          qr_code_not_set: "ร้านค้ายังไม่ได้ตั้งค่า QR Code สำหรับชำระเงิน",
          attach_receipt: "แนบสลิปการชำระเงิน",
          confirm_payment_button: "ยืนยันการชำระเงิน",
          upload_receipt_prompt: "กรุณาแนบสลิปการชำระเงิน",
          upload_success: "อัปโหลดสลิปสำเร็จ! ร้านค้าจะทำการตรวจสอบในเร็วๆ นี้",
          upload_fail: "เกิดข้อผิดพลาดในการอัปโหลดสลิป",
          load_order_fail: "ไม่สามารถโหลดข้อมูลออเดอร์ได้",

          bank_name_label: "ธนาคาร",
          account_name_label: "ชื่อบัญชี",
          account_number_label: "เลขที่บัญชี",
          copy_button: "คัดลอก",
          copied_button: "คัดลอกแล้ว!",

          // --- START: Login & Register Page ---
          login_title: "เข้าสู่ระบบ",
          username_label: "ชื่อผู้ใช้ หรืออีเมล",
          password_label: "รหัสผ่าน",
          forgot_password: "ลืมรหัสผ่าน?",
          login_button: "เข้าสู่ระบบ",
          or_divider: "หรือ",
          no_account_prompt: "ยังไม่มีบัญชีใช่ไหม?",
          create_account_link: "สร้างบัญชี",
          connect_server_fail: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
          register_title: "สร้างบัญชีใหม่",
          register_button: "ลงทะเบียน",
          already_have_account: "มีบัญชีอยู่แล้ว?",
          login_link: "เข้าสู่ระบบ",
          password_required: "กรุณากรอกรหัสผ่าน",
          password_min_length: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร",
          register_success: "ลงทะเบียนสำเร็จ! กำลังนำคุณไปยังหน้าล็อกอิน...",
          register_fail: "การลงทะเบียนล้มเหลว",

          // --- Landing Page ---
          skip_button: "ข้าม →",
          welcome_title: "ยินดีต้อนรับ",
          welcome_subtitle:
            "เริ่มต้นใช้งานโดยการเข้าสู่ระบบ หรือสร้างบัญชีใหม่",

          // --- TopNavBar ---
          nav_language: "ภาษา",
          nav_order_history: "ประวัติคำสั่งซื้อ",
          nav_logout: "ออกจากระบบ",
          nav_hello: "สวัสดี",
          nav_login: "เข้าสู่ระบบ",
          nav_register: "สร้างบัญชี",
          search_placeholder_nav: "ค้นหาสินค้า...",

          // --- Hero Section ---
          hero_community_tag: "จากชุมชนสู่มือคุณ",
          hero_title: "สัมผัสเสน่ห์แห่งลุ่มน้ำทะเลสาบ",
          hero_subtitle: "พบกับสินค้าหลากหลายจากภูมิปัญญาท้องถิ่น ส่งตรงถึงบ้านคุณ",
          hero_cta_button: "เลือกซื้อสินค้า",
        },
      },
    },
  });

export default i18n;
