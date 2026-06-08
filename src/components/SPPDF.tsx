// SPPDF.tsx
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';

// ========== STYLE ==========
const styles = StyleSheet.create({
  page: {
    paddingTop: 25, // tetap beri jarak atas
    paddingHorizontal: 25, // kiri kanan tetap aman
    paddingBottom: 0, // hilangkan jarak bawah
    fontSize: 8,
    fontFamily: 'Helvetica',
  },

  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  leftHeader: {
    flexDirection: 'column',
    width: '60%',
  },
  logo: {
    width: 90,
    height: 30,
    marginBottom: 3,
  },
  companyText: {
    fontSize: 8,
  },
  rightHeader: {
    width: '40%',
    textAlign: 'right',
  },
  title: {
    fontSize: 11,
    fontWeight: 'bold',
    textDecoration: 'underline',
  },
  subTitle: {
    fontSize: 10,
  },
  infoSection: {
    marginTop: 10,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  infoLabel: {
    fontSize: 8,
    textDecoration: 'underline',
    textAlign: 'center',
  },
  infoLabel2: {
    fontSize: 8,
    textAlign: 'center',
  },
  infoValue: {
    fontSize: 7,
    width: 200, // ⬅️ lebar kolom kanan — titik-titik sejajar
    textAlign: 'left',
    marginLeft: 5, // ⬅️ jarak kecil antara label dan titik dua
    minWidth: 80,
  },
  tableContainer: {
    alignSelf: 'flex-start', // tabel selebar konten
    border: '0.5 solid black',
    borderBottom: 0, // biar garis bawah ditarik dari cell
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    borderRight: '0.5 solid black',
    borderBottom: '0.5 solid black',
    textAlign: 'center',
    paddingVertical: 2,
    paddingHorizontal: 4,
    fontSize: 7,
  },

  cellDesc: {
    flex: 3,
  },
  cellSmall: {
    flex: 1,
  },
  footer: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  copyDivider: {
    marginVertical: 25,
    borderBottom: '1 dashed gray',
    textAlign: 'center',
    fontSize: 7,
    marginTop: 15,
  },

  watermarkContainerPortrait: {
    flex: 1,
    justifyContent: 'space-around', // lebih renggang antar baris
    alignItems: 'center',
  },

  watermarkRowPortrait: {
    flexDirection: 'row',
    justifyContent: 'space-evenly', // beri jarak antar kolom
    width: '100%',
    letterSpacing: 10,
  },

  watermarkTextPortrait: {
    fontSize: 40, // lebih besar & tebal
    fontWeight: 'bold',
    color: '#666',
    opacity: 0.5, // transparansi ideal (0.15–0.2)
    letterSpacing: 3,
  },
  pageBlack: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  fullBlackBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'white', // warna hitam pekat
    opacity: 1, // 100%
  },
});

// ========== TEMPLATE PER COPY ==========
const ShippingCopy = ({ data, sentBy, packedBy, toUnit }: any) => {
  const now = new Date();
  const formattedNoSP = `${String(now.getFullYear()).slice(2)}${String(
    now.getMonth() + 1
  ).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.${String(
    now.getHours()
  ).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')}`;

  const formattedDate = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <View>
      {/* HEADER */}
      <View style={[styles.headerContainer, { marginTop: -15 }]}>
        {/* LEFT */}
        <View style={styles.leftHeader}>
          <Image
            src="/gmf.png"
            style={{ width: 170, height: 'auto', marginLeft: 15 }} // ubah ukuran sesuai kebutuhan
          />
        </View>

        {/* RIGHT */}
        <View style={styles.rightHeader}>
          <Text style={{ fontSize: 11, textAlign: 'right' }}>
            NO. SP. &nbsp; {formattedNoSP}
          </Text>

          {/* baris kosong */}
          <Text style={{ marginBottom: 3 }}> </Text>

          {/* judul utama & subjudul, dipaksa rata kiri sejajar tabel */}
          <View
            style={{
              alignItems: 'flex-start',
              marginLeft: 105, // geser kiri agar sejajar tabel
            }}
          >
            <Text style={[styles.title, { textAlign: 'left' }]}>
              SURAT PENGIRIMAN
            </Text>
            <Text style={[styles.subTitle, { textAlign: 'left' }]}>
              Shipping Document
            </Text>
          </View>
        </View>
      </View>

      {/* INFO */}
      <View
        style={[
          styles.infoSection,
          { marginLeft: 40, marginTop: -15, marginBottom: 4 },
        ]}
      >
        {/* Kepada */}
        <View style={[styles.infoRow, { marginBottom: 0, paddingVertical: 0 }]}>
          <Text style={styles.infoLabel}>Kepada</Text>
          <Text style={styles.infoValue}>
            {'\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}:{' '}
            {toUnit || '................................................'}
          </Text>
        </View>

        <View style={[styles.infoRow, { marginBottom: 0, paddingVertical: 0 }]}>
          <Text style={styles.infoLabel2}>To</Text>
          <Text style={styles.infoValue}> </Text>
        </View>

        {/* Dikirim oleh */}
        <View style={[styles.infoRow, { marginBottom: 0, paddingVertical: 0 }]}>
          <Text style={styles.infoLabel}>Dikirim oleh</Text>
          <Text style={styles.infoValue}>
            : {sentBy || '................................................'}
          </Text>
        </View>

        <View style={[styles.infoRow, { marginBottom: 1, paddingVertical: 0 }]}>
          <Text style={styles.infoLabel2}>Sent By</Text>
          <Text style={styles.infoValue}> </Text>
        </View>
      </View>

      {/* TABLE */}
      <View style={styles.tableContainer}>
        {/* HEADER */}
        <View style={styles.row}>
          <View style={[styles.cell, { width: 55 }]}>
            <Text style={styles.infoLabel}>Tanggal</Text>
            <Text style={styles.infoLabel2}>Date</Text>
          </View>

          <View style={[styles.cell, { width: 50 }]}>
            <Text style={styles.infoLabel}>Banyaknya</Text>
            <Text style={styles.infoLabel2}>Qty</Text>
          </View>

          <View style={[styles.cell, { width: 340 }]}>
            <Text style={styles.infoLabel}>Macam dari barang-barang</Text>
            <Text style={styles.infoLabel2}>Description of Goods</Text>
          </View>

          <View style={[styles.cell, { width: 100 }]}>
            <Text style={styles.infoLabel}>Keterangan</Text>
            <Text style={styles.infoLabel2}>Remarks</Text>
          </View>
        </View>

        {/* BODY */}
        {Array.from({ length: 16 }).map((_, i) => {
          const item = data[i];
          const isFooter = i === 15;

          if (isFooter) {
            return (
              <View
                key={i}
                style={[
                  styles.row,
                  { minHeight: 24, alignItems: 'flex-start' }, // tinggi sama, isi mulai dari atas
                ]}
              >
                <Text
                  style={[styles.cell, { width: 55, minHeight: 24 }]}
                ></Text>
                <Text
                  style={[styles.cell, { width: 50, minHeight: 24 }]}
                ></Text>
                <View
                  style={[
                    styles.cell,
                    {
                      width: 340,
                      flexDirection: 'column', // kolom, biar keterangan bawah tetap di bawah
                      justifyContent: 'flex-start',
                      paddingLeft: 6,
                    },
                  ]}
                >
                  {/* Baris label + nilai sejajar horizontal */}
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.infoLabel, { textAlign: 'left' }]}>
                      Dikirim oleh :
                    </Text>
                    <Text
                      style={{ fontSize: 7, textAlign: 'left', marginLeft: 4 }}
                    >
                      {packedBy || '........................................'}
                    </Text>
                  </View>

                  {/* Keterangan bawah */}
                  <Text
                    style={[
                      styles.infoLabel2,
                      { textAlign: 'left', marginTop: 2 },
                    ]}
                  >
                    Packed by
                  </Text>
                </View>

                <Text
                  style={[styles.cell, { width: 100, minHeight: 24 }]}
                ></Text>
              </View>
            );
          }

          return (
            <View
              key={i}
              style={[styles.row, { minHeight: 14, alignItems: 'center' }]} // semua baris sama tinggi
            >
              <Text style={[styles.cell, { width: 55, minHeight: 14 }]}>
                {item ? formattedDate : ''}
              </Text>
              <Text style={[styles.cell, { width: 50, minHeight: 14 }]}>
                {item ? '1 EA' : ''}
              </Text>
              <Text
                style={[
                  styles.cell,
                  {
                    width: 340,
                    textAlign: 'left',
                    paddingLeft: 6,
                    minHeight: 14,
                  },
                ]}
              >
                {item
                  ? `${item.ac_reg} / ${item.order} / ${
                      item.description.length > 55
                        ? item.description.substring(0, 55) + '...'
                        : item.description
                    }`
                  : ''}
              </Text>

              <Text
                style={[
                  styles.cell,
                  {
                    width: 100,
                    textAlign: 'left',
                    paddingLeft: 6,
                    minHeight: 14,
                  },
                ]}
              >
                {item ? item.loc_doc : ''}
              </Text>
            </View>
          );
        })}
      </View>
      {/* FOOTER */}
      <View
        style={{
          flexDirection: 'column',
          alignItems: 'flex-start',
          marginTop: 6,
        }}
      >
        {/* 1. Tanda tangan penerima */}
        <View style={{ flexDirection: 'column', marginBottom: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.infoLabel}>Tanda tangan penerima :</Text>
            <Text style={[styles.infoValue, { marginLeft: 4 }]}>
              ....................................
            </Text>
          </View>
          <Text style={styles.infoLabel2}>Sign received</Text>
        </View>

        {/* 2. Tanggal */}
        <View style={{ flexDirection: 'column', marginBottom: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.infoLabel}>Tanggal :</Text>
            <Text style={[styles.infoValue, { marginLeft: 4 }]}>
              ....................................
            </Text>
          </View>
          <Text style={styles.infoLabel2}>Date</Text>
        </View>

        {/* 3. GMF/A-111 */}
        <Text style={styles.infoLabel2}>GMF/A-111</Text>
      </View>
    </View>
  );
};

// ========== MAIN DOCUMENT ==========
export const SPPDF = ({ data, sentBy, packedBy, toUnit }: any) => (
  <Document>
    {/* PAGE 1 - double copy */}
    <Page size="A4" style={styles.page}>
      {/* COPY 1 */}
      <View style={{ position: 'relative' }}>
        <ShippingCopy
          data={data}
          sentBy={sentBy}
          packedBy={packedBy}
          toUnit={toUnit}
        />
        {/* Footer kanan bawah Copy 1 */}
        <Text
          style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            fontSize: 8,
          }}
        >
          Copy 1 : Shipper
        </Text>
      </View>

      {/* Garis pembatas antar copy */}
      <Text style={styles.copyDivider}></Text>

      {/* COPY 2 */}
      <View style={{ position: 'relative' }}>
        <ShippingCopy
          data={data}
          sentBy={sentBy}
          packedBy={packedBy}
          toUnit={toUnit}
        />
        {/* Footer kanan bawah Copy 2 */}
        <Text
          style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            fontSize: 8,
          }}
        >
          Copy 2 : Receiver
        </Text>
      </View>
    </Page>
  </Document>
);
