import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(LanguageDetector) // ใช้เพื่อตรวจจับภาษาที่ตั้งค่าไว้ในเบราว์เซอร์
  .use(initReactI18next) // เชื่อม i18next กับ React
  .init({
    fallbackLng: "th", // ภาษาเริ่มต้นหากไม่เจอภาษาที่กำหนด
    debug: true, // แสดง log ใน console ตอนพัฒนา (ปิดเมื่อใช้งานจริง)
    interpolation: {
      escapeValue: false,
    },

    detection: {
      // ลำดับการตรวจหาภาษา
      order: ["localStorage", "navigator"],
      // กำหนดให้บันทึกภาษาที่เลือกลงใน localStorage
      caches: ["localStorage"],
    },

    resources: {
      en: {
        translation: {
          // --- ใส่คำแปลภาษาอังกฤษที่นี่ ---
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
          nav_home: "Home",
          nav_cart: "Cart",
          nav_location: "Location",
          nav_profile: "Profile",
          // Cart_Page
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
        },
      },
      th: {
        translation: {
          // --- ใส่คำแปลภาษาไทยที่นี่ ---
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
          nav_home: "หน้าแรก",
          nav_cart: "ตะกร้า",
          nav_location: "ที่อยู่",
          nav_profile: "โปรไฟล์",
          // Cart_Page
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
        },
      },
    },
  });

export default i18n;
