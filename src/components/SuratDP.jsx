"use client"

import React from "react";

export function SuratDp({onConfirm}) {
  return (
    <section className="payment-system-container flex flex-col gap-8">
      <h1 className="text-xl bold">Sistem Monetisasi dan Pembayaran</h1>

      <div className="section">
        <h2>Mekanisme Pembayaran sebagai Pelaksanaan Perjanjian</h2>
        <p>
          Sistem monetisasi pada website menerapkan mekanisme pembayaran uang
          muka (down payment) sebagai bentuk pelaksanaan awal perjanjian jasa
          antara wedding organizer dan konsumen. Pembayaran uang muka ditetapkan
          sebesar 50% (lima puluh persen) dari total nilai kontrak dan dilakukan
          pada saat penandatanganan perjanjian.
        </p>
        <p>
          Pembayaran DP tersebut menjadi bukti adanya kesepakatan para pihak
          dan menimbulkan hubungan hukum yang mengikat sebagaimana ketentuan
          Pasal 1320 Kitab Undang-Undang Hukum Perdata.
        </p>
        <p>
          Sisa pembayaran sebesar 50% (lima puluh persen) wajib dilunasi oleh
          konsumen dalam waktu maksimal 7 (tujuh) hari kerja setelah pembayaran
          DP dilakukan. Pelunasan tersebut merupakan bentuk pemenuhan
          kewajiban konsumen dalam perjanjian jasa yang telah disepakati.
        </p>
      </div>

      <div className="section">
        <h2>Pengunggahan Bukti Pembayaran</h2>
        <p>
          Website menyediakan fasilitas pengunggahan bukti pembayaran sebagai
          bagian dari sistem administrasi pembayaran. Konsumen diwajibkan
          mengunggah bukti pembayaran dalam waktu maksimal 1×24 jam setelah
          transaksi dilakukan, baik melalui transfer bank maupun pembayaran
          tunai. Pembatasan waktu pengunggahan ini bertujuan untuk memberikan
          kepastian administratif serta mendukung proses verifikasi pembayaran
          oleh pihak wedding organizer.
        </p>
      </div>

      <div className="section">
        <h2>Sistem Verifikasi Pembayaran</h2>
        <p>
          Website tidak mengimplementasikan sistem payment gateway otomatis.
          Website hanya berfungsi sebagai media pencatatan dan konfirmasi
          pembayaran, sedangkan proses verifikasi dilakukan secara manual oleh
          pihak wedding organizer. Verifikasi manual dilakukan untuk memastikan
          kesesuaian antara pembayaran yang dilakukan konsumen dengan ketentuan
          perjanjian jasa yang telah disepakati, serta untuk meminimalisasi
          potensi sengketa di kemudian hari.
        </p>
      </div>

      <div className="section">
        <h2>Penyampaian Informasi Progres Pelaksanaan Layanan</h2>
        <p>
          Website tidak difungsikan sebagai media pemantauan progres
          pelaksanaan layanan secara langsung. Informasi mengenai pelaksanaan
          pekerjaan jasa wedding organizer disampaikan kepada konsumen melalui
          media komunikasi WhatsApp sebagai sarana komunikasi langsung antara
          para pihak. Dengan demikian, website berfokus pada fungsi administratif
          pembayaran, sedangkan pelaksanaan perjanjian jasa dikomunikasikan
          secara langsung di luar sistem website.
        </p>
      </div>

      <div className="section">
        <h2>Notifikasi Status Pembayaran</h2>
        <p>
          Website menyediakan fitur notifikasi berupa pop-up informasi yang
          menampilkan status pembayaran konsumen. Notifikasi ini bertujuan untuk
          memberikan informasi administratif mengenai tahapan pembayaran, seperti
          status menunggu verifikasi, pembayaran terverifikasi, dan pelunasan
          pembayaran. Informasi yang ditampilkan bersifat informatif dan tidak
          menggantikan komunikasi langsung antara wedding organizer dan konsumen.
        </p>
      </div>

      <div className="section">
        <h2>Fitur Undangan Digital</h2>
        <p>
          Website menyediakan fitur undangan digital sebagai bagian dari layanan
          yang diberikan kepada konsumen. Fitur ini dapat diakses oleh konsumen
          pada H-7 (tujuh hari) sebelum pelaksanaan acara pernikahan. Akses terhadap
          fitur undangan digital disesuaikan dengan status pembayaran yang tercatat
          pada sistem dan merupakan bagian dari pelaksanaan perjanjian jasa.
        </p>
      </div>

      <div className="section">
        <h2>Konsekuensi Pembatalan oleh Konsumen</h2>
        <p>
          Apabila konsumen melakukan pembatalan perjanjian secara sepihak setelah
          pembayaran uang muka (down payment) dilakukan, maka pembayaran DP yang
          telah diserahkan dinyatakan hangus dan tidak dapat dikembalikan.
          Ketentuan tersebut didasarkan pada fungsi DP sebagai bentuk kesungguhan
          dan jaminan pelaksanaan perjanjian jasa.
        </p>
        <p>
          Pembatalan oleh konsumen setelah adanya pembayaran DP dapat
          dikualifikasikan sebagai wanprestasi, karena konsumen tidak melanjutkan
          kewajibannya sebagaimana yang telah disepakati dalam perjanjian. Dalam
          hal pembatalan tersebut menimbulkan kerugian bagi pihak wedding
          organizer, maka pihak penyedia jasa berhak untuk tidak melanjutkan
          layanan tanpa kewajiban pengembalian DP yang telah diterima.
        </p>
      </div>

      <button className="button2" onClick={onConfirm}>Agree & Continue</button>
    </section>
  );
}
