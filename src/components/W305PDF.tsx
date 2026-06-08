import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 9,
    flexDirection: 'column',
  },
  table: {
    display: 'table',
    width: '100%',
    borderWidth: 1,
    borderColor: 'black',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: 'black',
  },
  titleRow: {
    borderBottomWidth: 1,
    borderColor: 'black',
    backgroundColor: 'white',
    flexDirection: 'row',
  },
  titleCellWrapper: {
    flex: 1,
    paddingVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },

  cell: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  leftHalf: {
    width: '70%',
    paddingLeft: 10,
    paddingRight: 180,
  },
  rightHalf: {
    width: '40%',
    paddingLeft: 10,
    borderLeftWidth: 1,
    borderColor: 'black',
  },
  label: {
    width: '40%',
    fontWeight: 'bold',
    textAlign: 'left',
  },
  colon: {
    fontSize: 10,
    marginHorizontal: 4,
  },
  value: {
    fontSize: 9,
    width: '50%',
    paddingLeft: 0,
  },
  tableCell: {
    borderWidth: 1,
    borderColor: 'black',
    padding: 4,
    fontSize: 9,
    textAlign: 'center',
    fontWeight: 'bold',
  },

  tableRow: {
    flexDirection: 'row',
  },
  tableHeaderCell: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'black',
    fontWeight: 'bold',
    fontSize: 10,
    padding: 4,
    textAlign: 'center',
  },
  tableCellContent: {
    display: 'flex', // Bikin container flex
    justifyContent: 'center', // Rata tengah vertikal
    alignItems: 'center', // Rata tengah horizontal dalam row flex
    textAlign: 'center', // Teks di tengah (horizontal)
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'black',
    fontSize: 8,
    paddingLeft: 4,
    paddingRight: 4,
    minHeight: 20, // Atur tinggi minimum agar sel punya ruang vertikal
  },

  noBottomBorder: {
    borderBottomWidth: 0,
  },
  cellStatus: {
    width: '5%',
    borderWidth: 0.5,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 2,
  },
});

const HandOverPDF = ({ data = {} }) => {
  const formatRow = (leftLabel, leftValue, rightLabel, rightValue) => (
    <View style={styles.row}>
      <View style={[styles.cell, styles.leftHalf]}>
        <Text style={styles.label}>{leftLabel}</Text>
        <Text style={styles.colon}>:</Text>
        <Text style={styles.value}>{leftValue}</Text>
      </View>
      <View style={[styles.cell, styles.rightHalf]}>
        <Text style={styles.label}>{rightLabel}</Text>
        <Text style={styles.colon}>:</Text>
        <Text style={styles.value}>{rightValue}</Text>
      </View>
    </View>
  );

  // Supervisor & Manager OUT
  const supervisorOutName = data.supervisorOut?.split('/')?.[1]?.trim() || '';
  const supervisorOutId = data.supervisorOut?.split('/')?.[0]?.trim() || '';
  const managerOutName = data.managerOut?.split('/')?.[1]?.trim() || '';
  const managerOutId = data.managerOut?.split('/')?.[0]?.trim() || '';
  const timeOut = data.timeOut || ''; // langsung pakai dari input

  // Supervisor & Manager IN
  const supervisorInName = data.supervisorIn?.split('/')?.[1]?.trim() || '';
  const supervisorInId = data.supervisorIn?.split('/')?.[0]?.trim() || '';
  const managerInName = data.managerIn?.split('/')?.[1]?.trim() || '';
  const managerInId = data.managerIn?.split('/')?.[0]?.trim() || '';
  const timeIn = data.timeIn || '';

  console.log('managerOut:', data.managerOut);
  console.log('managerIn:', data.managerIn);
  console.log('timeOut:', data.timeOut);
  console.log('timeIn:', data.timeIn);

  const renderValue = (role, label) => {
    if (role === 'supervisorOut') {
      if (label === 'Name') return supervisorOutName || '-';
      if (label === 'Id No') return supervisorOutId || '-';
      if (label === 'Time') return timeOut || '-';
    }
    if (role === 'managerOut') {
      if (label === 'Name') return managerOutName || '-';
      if (label === 'Id No') return managerOutId || '-';
      if (label === 'Time') return timeOut || '-';
    }
    if (role === 'supervisorIn') {
      if (label === 'Name') return supervisorInName || '-';
      if (label === 'Id No') return supervisorInId || '-';
      if (label === 'Time') return timeIn || '-';
    }
    if (role === 'managerIn') {
      if (label === 'Name') return managerInName || '-';
      if (label === 'Id No') return managerInId || '-';
      if (label === 'Time') return timeIn || '-';
    }
    return '';
  };

  const chunkArray = (array, size) => {
    return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
      array.slice(i * size, i * size + size)
    );
  };

  return (
    <Document>
      {chunkArray(data.items || [], 12).map((chunk, pageIndex) => (
        <Page
          key={pageIndex}
          size="A4"
          orientation="landscape"
          style={styles.page}
        >
          <View style={styles.table}>
            <View style={styles.titleRow}>
              <View style={styles.titleCellWrapper}>
                <Text style={styles.titleText}>
                  HAND OVER MAINTENANCE STATUS
                </Text>
              </View>
            </View>

            {formatRow(
              'Date',
              data.date || 'N/A',
              'Aircraft Registration',
              data.acReg || 'N/A'
            )}
            {formatRow(
              'Outgoing Crew',
              data.crewOut || '{CREW OUT}',
              'Type of Inspection',
              data.inspection || 'N/A'
            )}
            {formatRow(
              'Shift Out',
              data.shiftOut || '{SHIFT OUT}',
              'Work Order No',
              data.woNumber || 'N/A'
            )}
            {formatRow(
              'Incoming Crew',
              data.crewIn || '{CREW IN}',
              'Hangar In Date',
              data.hangarIn || 'N/A'
            )}
            {formatRow(
              'Shift In',
              data.shiftIn || '{SHIFT IN}',
              'Hangar Out Date',
              data.hangarOut || 'N/A'
            )}

            <View style={styles.tableRow}>
              <Text
                style={[
                  styles.tableHeaderCell,
                  { width: '5%' },
                  styles.noBottomBorder,
                ]}
              >
                No.
              </Text>
              <Text
                style={[
                  styles.tableHeaderCell,
                  { width: '12%' },
                  styles.noBottomBorder,
                ]}
              >
                Reference No.
              </Text>
              <Text
                style={[
                  styles.tableHeaderCell,
                  { width: '60%' },
                  styles.noBottomBorder,
                ]}
              >
                Description
              </Text>
              <Text
                style={[styles.tableHeaderCell, { width: '15%' }]}
                colSpan={3}
              >
                Status
              </Text>
              <Text
                style={[
                  styles.tableHeaderCell,
                  { width: '28.78%' },
                  styles.noBottomBorder,
                ]}
              >
                Remarks
              </Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableHeaderCell, { width: '5%' }]}></Text>
              <Text style={[styles.tableHeaderCell, { width: '12%' }]}></Text>
              <Text style={[styles.tableHeaderCell, { width: '60%' }]}></Text>
              <Text style={[styles.tableHeaderCell, { width: '5%' }]}>O</Text>
              <Text style={[styles.tableHeaderCell, { width: '5%' }]}>P</Text>
              <Text style={[styles.tableHeaderCell, { width: '5%' }]}>C</Text>
              <Text
                style={[styles.tableHeaderCell, { width: '28.78%' }]}
              ></Text>
            </View>

            {Array.from({ length: 12 }).map((_, idx) => {
              const row = chunk[idx];
              return (
                <View key={idx}>
                  <View style={[styles.tableRow, { minHeight: 25.6 }]}>
                    <View style={[styles.tableCellContent, { width: '5%' }]}>
                      <Text>{row?.no ?? ' '}</Text>
                    </View>
                    <View style={[styles.tableCellContent, { width: '12%' }]}>
                      <Text>{row?.reference ?? ' '}</Text>
                    </View>
                    <View
                      style={[
                        styles.tableCellContent,
                        {
                          width: '60%',
                          flexDirection: 'row',
                          alignItems: 'center',
                        },
                      ]}
                    >
                      <Text
                        style={{
                          width: '15%',
                          paddingRight: 2,
                          flexWrap: 'wrap',
                          textAlign: 'left',
                        }}
                      >
                        {row?.acReg ?? ''}
                      </Text>
                      <Text
                        style={{
                          width: '85%',
                          flexWrap: 'wrap',
                          textAlign: 'left',
                        }}
                      >
                        {row?.description ?? ''}
                      </Text>
                    </View>
                    <View style={[styles.tableCellContent, { width: '5%' }]}>
                      <Text>
                        {row?.status?.toUpperCase() === 'OPEN' ? 'X' : ''}
                      </Text>
                    </View>
                    <View style={[styles.tableCellContent, { width: '5%' }]}>
                      <Text>
                        {row?.status?.toUpperCase() === 'PROGRESS' ? 'X' : ''}
                      </Text>
                    </View>
                    <View style={[styles.tableCellContent, { width: '5%' }]}>
                      <Text>
                        {row?.status?.toUpperCase() === 'CLOSED' ? 'X' : ''}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.tableCellContent,
                        {
                          width: '28.78%',
                          flexWrap: 'wrap',
                          textAlign: 'left',
                          paddingLeft: 6,
                          justifyContent: 'center',
                        },
                      ]}
                    >
                      <Text>{row?.remark ?? ' '}</Text>
                    </View>
                  </View>
                </View>
              );
            })}

            <View
              style={{
                flexDirection: 'row',
                borderWidth: 0.5,
                borderColor: '#000',
              }}
            >
              <View
                style={{
                  flex: 1,
                  padding: 2,
                  borderRightWidth: 1,
                  borderColor: '#000',
                  alignItems: 'center',
                }}
              >
                <Text>OUTGOING CREW</Text>
              </View>
              <View style={{ flex: 1, padding: 2, alignItems: 'center' }}>
                <Text>INCOMING CREW</Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: 'row',
                borderWidth: 1,
                borderColor: '#000',
              }}
            >
              <View
                style={{ flex: 1, borderRightWidth: 1, borderColor: '#000' }}
              >
                <View style={{ flexDirection: 'row', borderColor: '#000' }}>
                  <Text
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: 2,
                      borderRightWidth: 1,
                    }}
                  >
                    Supervisor
                  </Text>
                  <Text style={{ flex: 1, textAlign: 'center', padding: 2 }}>
                    Manager
                  </Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  {[0, 1].map((i) => (
                    <View
                      key={i}
                      style={{
                        flex: 1,
                        padding: 2,
                        borderRightWidth: i === 0 ? 1 : 0,
                        borderColor: '#000',
                      }}
                    >
                      {['Name', 'Id No', 'Time', 'Sign'].map((label) => (
                        <View
                          key={label}
                          style={{ flexDirection: 'row', marginBottom: 2 }}
                        >
                          <Text style={{ width: 40 }}>{label}</Text>
                          <Text>: </Text>
                          <Text style={{ flex: 1 }}>
                            {renderValue(
                              i === 0 ? 'supervisorOut' : 'managerOut',
                              label
                            )}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', borderColor: '#000' }}>
                  <Text
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: 2,
                      borderRightWidth: 1,
                    }}
                  >
                    Supervisor
                  </Text>
                  <Text style={{ flex: 1, textAlign: 'center', padding: 2 }}>
                    Manager
                  </Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  {[0, 1].map((i) => (
                    <View
                      key={i}
                      style={{
                        flex: 1,
                        padding: 2,
                        borderRightWidth: i === 0 ? 1 : 0,
                        borderColor: '#000',
                      }}
                    >
                      {['Name', 'Id No', 'Time', 'Sign'].map((label) => (
                        <View
                          key={label}
                          style={{ flexDirection: 'row', marginBottom: 2 }}
                        >
                          <Text style={{ width: 40 }}>{label}</Text>
                          <Text>: </Text>
                          <Text style={{ flex: 1 }}>
                            {renderValue(
                              i === 0 ? 'supervisorIn' : 'managerIn',
                              label
                            )}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>

          <View style={{ position: 'absolute', bottom: 10, left: 20 }}>
            <Text style={{ fontSize: 8 }}>Form No.: GMF/Q-392</Text>
          </View>

          {/* Page Number */}
          <Text
            style={{
              position: 'absolute',
              fontSize: 8,
              bottom: 10,
              right: 20,
              textAlign: 'right',
            }}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageIndex + 1} of ${totalPages}`
            }
          />
        </Page>
      ))}
    </Document>
  );
};

export default HandOverPDF;
