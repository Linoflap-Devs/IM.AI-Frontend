import { create } from "zustand";
import jap from "date-fns/locale/ja";
import enUS from "date-fns/locale/en-US";
import { Locale } from "date-fns";

interface LocalizedString {
  en: string;
  ja: string;
}
interface LocalExtended {
  en: Locale;
  ja: Locale;
}
interface TransferStock {
  "Transfer Stock": LocalizedString;
  "Pending Company Approval": LocalizedString;
  "Pending Store Approval": LocalizedString;
  "Company Approved": LocalizedString;
  "For Shipping": LocalizedString;
  Received: LocalizedString;
  Declined: LocalizedString;
}

export const useI18nStore = create<I18nStore>((set) => ({
  locale: "en",
  localeExtended: {
    en: enUS,
    ja: jap,
  },
  localeName: {
    en: "🇺🇸 English",
    ja: "🇯🇵 Japanese",
  },
  setLocale: (value) =>
    set((state) => ({
      ...state,
      locale: value,
    })),

  /* NavBar */
  NBTitle: { en: "IM.AI CART", ja: "IM.AI カート" },
  /* Dashboard */
  salesOverviewi18n: { en: "Sales Overview", ja: "売上概要" },
  storeActivityi18n: { en: "Store Activity", ja: "店舗活動" },
  topSellingProducti18n: {
    en: "Top Selling Products",
    ja: "トップ売れた商品",
  },
  leastSellingProducti18n: {
    en: "Least Selling Products",
    ja: "最も売れない商品",
  },
  cartsi18n: {
    en: "Carts",
    ja: "カート",
  },
  Viewi18n: { en: "View", ja: "表示" },
  Producti18n: { en: "Product", ja: "商品" },
  ProdNamei18n: { en: "Product Name", ja: "商品名" },
  Pricei18n: { en: "Price", ja: "価格" },
  ThresValuei18n: { en: "Threshold Value", ja: "しきい値" },
  Availi18n: { en: "Available", ja: "在庫" },
  Expiryi18n: { en: "Expiry Date", ja: "有効期限" },
  Quantityi18n: { en: "Quantity", ja: "数量" },
  Actioni18n: { en: "Action", ja: "アクション" },
  Batteryi18n: { en: "Battery", ja: "バッテリー" },
  Statusi18n: { en: "Status", ja: "状態" },
  Reporti18n: { en: "Report", ja: "レポート" },
  Pagei18n: { en: "Page", ja: "ページ" },
  Ofi18n: { en: "Of", ja: "/" },
  Reseti18n: { en: "Reset", ja: "リセット" },
  Tablei18n: { en: "Table", ja: "データ テーブル" },
  Categoryi18n: { en: "Category", ja: "カテゴリー" },
  Uniti18n: { en: "Unit", ja: "単位" },
  Addi18n: { en: "Add", ja: "追加" },
  Editi18n: { en: "Edit", ja: "編集" },
  Downloadi18n: { en: "Download", ja: "ダウンロード" },
  Datai18n: { en: "Data", ja: "データ" },
  Searchi18n: { en: "Search", ja: "検索" },
  PickADatei18n: { en: "Pick A Date", ja: "日付を選択してください" },
  Uploadi18n: { en: "Upload", ja: "アップロード" },
  Imagei18n: { en: "Image", ja: "画像" },
  SetDateRangei18n: { en: "Set Date Range", ja: "日付範囲を設定" },
  DateTimei18n: { en: "Date & Time", ja: "日付と時刻" },
  Customeri18n: { en: "Customer", ja: "顧客" },
  Customersi18n: { en: "Customers", ja: "顧客" },
  Notesi18n: { en: "Notes", ja: "備考" },
  Transactioni18n: { en: "Transaction", ja: "取引" },
  Useri18n: { en: "User", ja: "ユーザー" },
  Activityi18n: { en: "Activity", ja: "活動" },
  Salesi18n: { en: "Sales", ja: "売上" },
  Profiti18n: { en: "Profit", ja: "利益" },
  IDi18n: { en: "ID", ja: "ID" },
  Revenuei18n: { en: "Revenue", ja: "収益" },
  TransactionHistoryi18n: { en: "Transaction History", ja: "取引履歴" },
  TransactionTypei18n: { en: "Transaction Type", ja: "取引種別" },
  UserActivityi18n: { en: "User Activity", ja: "ユーザー活動" },
  Logouti18n: { en: "Logout", ja: "ログアウト" },
  Settingsi18n: { en: "Settings", ja: "設定" },
  Emaili18n: { en: "Email", ja: "メールアドレス" },
  CreateOTAi18n: { en: "Create One Time User", ja: "ワンタイムユーザー作成" },
  Registeri18n: { en: "Register", ja: "登録" },
  Passwordi18n: { en: "Password", ja: "<PASSWORD>" },
  PromoCodei18n: { en: "Promo Code", ja: "プロモーションコード" },
  PromoListi18n: { en: "Promo List", ja: "プロモーションリスト" },
  PromoProductsi18n: { en: "Promo Products", ja: "プロモーション商品" },
  Supplieri18n: { en: "Supplier", ja: "仕入先" },
  Contacti18n: { en: "Contact", ja: "連絡先" },
  ContactPersoni18n: { en: "Contact Person", ja: "連絡先担当者" },
  SupplierNamei18n: { en: "Supplier Name", ja: "仕入先名" },
  AddProducti18n: { en: "Add Product", ja: "商品追加" },
  ProductSuppliedi18n: { en: "Productshmm Supplied", ja: "商品提供" },
  Submiti18n: { en: "Submit", ja: "送信" },
  ProductListi18n: { en: "Product List", ja: "商品リスト" },
  Deletei18n: { en: "Delete", ja: "削除" },
  SupplierProfilei18n: { en: "Supplier Profile", ja: "仕入先プロフィール" },
  AddSupplieri18n: { en: "Add Supplier", ja: "仕入先追加" },
  StoreListi18n: { en: "Store List", ja: "店舗リスト" },
  AddStorei18n: { en: "Add Store", ja: "店舗追加" },
  Removei18n: { en: "Remove", ja: "削除" },
  Namei18n: { en: "Name", ja: "名前" },
  Percentagei18n: { en: "Percentage", ja: "割合" },
  PromoProducti18n: { en: "Promo Product", ja: "プロモーション商品" },
  AlertDialogue1i18n: {
    en: "This action cannot be undone. This will permanently delete this record on our servers.",
    ja: "この操作は元に戻せません。この操作は本当に削除されます。",
  },
  AlertDialogue2i18n: {
    en: "Are you absolutely sure?",
    ja: "本当に削除しますか？",
  },
  Canceli18n: { en: "Cancel", ja: "キャンセル" },
  AddPromoi18n: { en: "Add Promo", ja: "プロモーション追加" },
  Continuei18n: { en: "Continue", ja: "続ける" },

  PrimaryDetailsi18n: { en: "Primary Details", ja: "プライマリ詳細" },
  SupplierDetailsi18n: { en: "Supplier Details", ja: "仕入先詳細" },
  ProductIDi18n: { en: "Product ID", ja: "商品ID" },
  OpeningStocksi18n: { en: "Opening Stocks", ja: "在庫開始" },
  RemainingStocksi18n: { en: "Remaining Stocks", ja: "残り在庫" },
  ThresholStockValuei18n: { en: "Threshold Stock Value", ja: "しきい値在庫" },
  StoreNamei18n: { en: "Store Name", ja: "店舗名" },
  StockInHandi18n: { en: "Stock In Hand", ja: "在庫在庫" },
  Purchasesi18n: { en: "Purchases", ja: "購入" },
  StockLocationi18n: { en: "Stock Location", ja: "在庫場所" },
  Overviewi18n: { en: "Overview", ja: "概要" },
  BranchNamei18n: {
    en: "Branch Name",
    ja: "支店名",
  },

  PurchaseDatei18n: {
    en: "Purchase Date",
    ja: "購入日",
  },

  QuantitySoldi18n: {
    en: "Quantity Sold",
    ja: "販売数",
  },

  TotalCosti18n: {
    en: "Total Cost",
    ja: "合計コスト",
  },
  Savei18n: { en: "Save", ja: "扶ける" },
  Carti18n: { en: "Cart", ja: "カート" },
  EnterEmaili18n: { en: "Enter Email", ja: "メールを入力してください" },
  AddStoreMsgi8n: {
    en: "Fill up all fields required to add a new Store",
    ja: "新しい店舗を追加するには、必要なすべてのフィールドを入力してください",
  },

  StoreNamei8n: {
    en: "Store Name",
    ja: "店舗名",
  },
  AddStoreNamei8n: {
    en: "Add Store Name",
    ja: "店舗名を追加",
  },
  Addressi8n: {
    en: "Address",
    ja: "住所",
  },
  AddAddressi8n: {
    en: "Add Address",
    ja: "住所を追加",
  },
  ContactNumberi8n: {
    en: "Contact Number",
    ja: "連絡先番号",
  },
  AddContactNumberi8n: {
    en: "Add Contact Number",
    ja: "連絡先番号を追加",
  },
  ContactPersoni8n: {
    en: "Contact Person",
    ja: "連絡先担当者",
  },
  AddContactPersoni8n: {
    en: "Add Contact Person",
    ja: "連絡先担当者を追加",
  },
  AddStorei8n: {
    en: "Add Store",
    ja: "店舗を追加",
  },
  CompanyIdi8n: {
    en: "Company ID",
    ja: "会社ID",
  },
  Companyi8n: {
    en: "Company",
    ja: "会社",
  },
  AddCompanyIdi8n: {
    en: "Add Company ID",
    ja: "会社IDを追加",
  },
  TransactionStatusi18n: {
    en: "Transaction Status",
    ja: "取引ステータス",
  },
  ReferenceNumberi18n: {
    en: "Reference Number",
    ja: "参照番号",
  },
  InUsei18n: {
    en: "In-Use",
    ja: "使用中",
  },
  LowBatteryi18n: {
    en: "Low Battery",
    ja: "バッテリーが少ない",
  },
  Availablei18n: {
    en: "Available",
    ja: "利用可能",
  },
  Chargingi18n: {
    en: "Charging",
    ja: "充電中",
  },
  Maintenancei18n: {
    en: "Maintenance",
    ja: "メンテナンス中",
  },
  ClientListi18n: {
    en: "Client List",
    ja: "顧客リスト",
  },
  Discounti18n: {
    en: "Discount",
    ja: "割引",
  },
  SelectPromoNamei18n: {
    en: "Select Promo Name",
    ja: "プロメオ名を選択",
  },
  SelectCategoryi18n: {
    en: "Select Category",
    ja: "カテゴリーを選択",
  },
  EnterPercDisci18n: {
    en: "Enter Percentage Discount",
    ja: "割合割引を入力",
  },
  EnterPromoCodei18n: {
    en: "Enter Promo Code",
    ja: "プロメオコードを入力",
  },
  Branchi18n: {
    en: "Branch",
    ja: "支店",
  },
  Companyi18n: {
    en: "Company",
    ja: "会社",
  },
  ActualWeighti18n: {
    en: "Actual Weight",
    ja: "実際の重量",
  },
  Barcodei18n: {
    en: "Barcode",
    ja: "バーコード",
  },
  ProdWeighti18n: {
    en: "Product Weight",
    ja: "商品の重量",
  },
  Gramsi18n: {
    en: "grams",
    ja: "グラム",
  },
  Previousi18n: {
    en: "Previous",
    ja: "前",
  },
  Nexti18n: {
    en: "Next",
    ja: "次",
  },
  TransferStocki18n: {
    "Transfer Stock": {
      en: "Transfer Stock",
      ja: "在庫移動",
    },
    "Pending Company Approval": {
      en: "Pending Company Approval",
      ja: "会社承認待ち",
    },
    "Pending Store Approval": {
      en: "Pending Store Approval",
      ja: "店舗承認待ち",
    },
    "Company Approved": {
      en: "Company Approved",
      ja: "会社承認済み",
    },
    "For Shipping": {
      en: "For Shipping",
      ja: "配送中",
    },
    Received: {
      en: "Received",
      ja: "受け取り済み",
    },
    Declined: {
      en: "Declined",
      ja: "却下済み",
    },
  },
  Loadingi18n: {
    en: "Loading...",
    ja: "ロード中...",
  },
  AddBranchi18n: {
    en: "Add Branch",
    ja: "支店を追加",
  },
  BranchListi18n: {
    en: "Branch List",
    ja: "支店リスト",
  },
  FullNamei18n: {
    en: "Full Name",
    ja: "氏名",
  },
  ContactNumberi18n: {
    en: "Contact Number",
    ja: "連絡先番号",
  },
  CreatedSincei18n: {
    en: "Created Since",
    ja: "作成日",
  },
  NetWeighti18n: {
    en: "Net Weight",
    ja: "総重量",
  },
  LowStockLvli18n: {
    en: "Low Stock Level",
    ja: "在庫レベル",
  },
  CriticalStockLvli18n: {
    en: "Critical Stock Level",
    ja: "重要な在庫レベル",
  },
  ProductSoldi18n: {
    en: "Product Sold",
    ja: "売上商品",
  },
  Gainsi18n: {
    en: "Gains",
    ja: "利益",
  },
  ActivePromoi18n: {
    en: "Active Promo",
    ja: "プロモーション",
  },
  CartIssuesi18n: {
    en: "Cart Issues",
    ja: "カート問題",
  },
  NewProductsi18n: {
    en: "New Products",
    ja: "新製品",
  },
  Soldi18n: {
    en: "Sold",
    ja: "販売済み",
  },
  SeeAlli18n: {
    en: "See All",
    ja: "すべて見る",
  },
  Stocksi18n: {
    en: "Stocks",
    ja: "在庫",
  },
  AddStocksi18n: {
    en: "Add Stocks",
    ja: "在庫を追加",
  },
  ReStockImmediatelyi18n: {
    en: "Re-Stock Immediately",
    ja: "すぐに補充する",
  },
  RequestTransferi18n: {
    en: "Request Transfer",
    ja: "転送依頼",
  },
  DateIssuedi18n: {
    en: "Date Issued",
    ja: "発行日",
  },
  DateReceivedi18n: {
    en: "Date Received",
    ja: "受領日",
  },
  ReceiverBranchi18n: {
    en: "Receiver Branch",
    ja: "受領支店",
  },
  SenderBranchi18n: {
    en: "Sender Branch",
    ja: "発行支店",
  },
  AddReporti18n: {
    en: "Add Report",
    ja: "レポートを追加",
  },
  UnusualTransactioni18n: {
    en: "Unusual Transaction",
    ja: "不正な取引",
  },
  CartIDi18n: {
    en: "Cart ID",
    ja: "カードID",
  },
  Remarksi18n: {
    en: "Remarks",
    ja: "備考",
  },
  Datei18n: {
    en: "Date",
    ja: "日付",
  },
  SalesReporti18n: {
    en: "Sales Report",
    ja: "売上レポート",
  },
  Itemsi18n: {
    en: "Items",
    ja: "アイテム",
  },
  AllowTransferi18n: {
    en: "Allow Transfer",
    ja: "転送を許可",
  },
  CustomerListi18n: {
    en: "Customer List",
    ja: "顧客リスト",
  },
  AddGuesti18n: {
    en: "Add Guest",
    ja: "ゲストを追加",
  },
  PromoNamei18n: {
    en: "Promo Name",
    ja: "プロモーション名",
  },
  SelectAUniti18n: {
    en: "Select A Unit",
    ja: "単位を選択",
  },
  AddTransferStocksi18n: {
    en: "Add Transfer Stocks",
    ja: "転送在庫を追加",
  },
  Confirmi18n: {
    en: "Confirm",
    ja: "確認",
  },
  SelectProducti18n: {
    en: "Select Product",
    ja: "製品を選択",
  },
  Closei18n: {
    en: "Close",
    ja: "閉じる",
  },
  AddReportForCartIDi18n: {
    en: "Add Report For Cart ID",
    ja: "カードIDでレポートを追加",
  },
  EnterReporti18n: {
    en: "Enter Report",
    ja: "レポートを入力",
  },
  CreateGuestAccounti18n: {
    en: "Create Guest Account",
    ja: "ゲストアカウントを作成",
  },
  CreateANewGuestOrOneTimeAccount: {
    en: "Create a new Guest or One-Time Account",
    ja: "ゲストを新規作成または一時アカウントを作成",
  },
  EnterPromoNamei18n: {
    en: "Enter Promo Name",
    ja: "プロモーション名を入力",
  },
  SelectProductsIncludedToThePromoi18n: {
    en: "Select Products Included to the Promo.",
    ja: "プロモーションに含まれる製品を選択",
  },
  PleaseSelectACompanyOrABranchi18n: {
    en: "Please Select a Company or a Branch",
    ja: "企業または支店を選択してください",
  },
  SupplierListi18n: {
    en: "Supplier List",
    ja: "サポートリスト",
  },
  SelectCompanyi18n: {
    en: "Select Company",
    ja: "企業を選択",
  },
  ScanQRCodei18n: {
    en: "Scan QR Code",
    ja: "QRコードをスキャン",
  },
  ScanAgaini18n: {
    en: "Scan Again",
    ja: "もう一度スキャン",
  },
  TotalPricei18n: {
    en: "Total Price",
    ja: "合計金額",
  },
  SubTotali18n: {
    en: "Sub Total",
    ja: "小計",
  },
  Paymenti18n: {
    en: "Payment",
    ja: "お支払い",
  },
  AreYouAbsolutelySurei18n: {
    en: "Are you absolutely sure?",
    ja: "本当に本気ですべての操作を実行しますか？",
  },
  ThisActionCannotBeUndoneThisWillPermanentlyDeleteYourAccountAndRemoveYourDataFromOurServersi18n:
    {
      en: "This action cannot be undone. This will permanently delete your account and remove your data from our servers.",
      ja: "この操作は取り消せません。この操作は永久にアカウントを削除し、サーバーからのデータを削除します。",
    },
  GoBacki18n: {
    en: "Go Back",
    ja: "戻る",
  },
  CardPaymenti18n: {
    en: "Card Payment",
    ja: "カード決済",
  },
  CashPaymenti18n: {
    en: "Cash Payment",
    ja: "現金決済",
  },
  PleaseEnterYourCardDetailsi18n: {
    en: "Please enter your card details",
    ja: "カードの詳細を入力してください",
  },
  CardNumberi18n: {
    en: "Card Number",
    ja: "カード番号",
  },
  PleaseEnterExactCashAmounti18n: {
    en: "Please enter exact cash amount",
    ja: "正確な現金額を入力してください",
  },
  TenderAmounti18n: {
    en: "Tender Amount",
    ja: "支払金額",
  },
  AmountToPayi18n: {
    en: "Amount To Pay",
    ja: "支払金額",
  },
  ValidThrui18n: {
    en: "Valid Thru",
    ja: "有効期限",
  },
  Resolvei18n: {
    en: "Resolve",
    ja: "解決",
  },
  Resolvedi18n: {
    en: "Resolved",
    ja: "解決済",
  },
  Unresolvedi18n: {
    en: "Unresolved",
    ja: "未解決",
  },
  Accidentali18n: {
    en: "Accidental",
    ja: "不正",
  },
  EditSupplieri18n: {
    en: "Edit Supplier",
    ja: "サプライヤーを編集する",
  },
  Hoveri18n: {
    en: "Hover",
    ja: "ホバー",
  },
  Expiredi18n: {
    en: "Expired",
    ja: "期限切れ",
  },
  Activei18n: {
    en: "Active",
    ja: "有効",
  },
  Changei18n: {
    en: "Change",
    ja: "変更",
  },
  YourChangeIsi18n: {
    en: "Your change is",
    ja: "あなたのお釣りは",
  },
  Proceedi18n: {
    en: "Proceed",
    ja: "続行",
  },
  PaymentSuccessfuli18n: {
    en: "Payment Successful!",
    ja: "お支払い完了しました！",
  },
  PaymentFailedi18n: {
    en: "Payment Failed!",
    ja: "お支払い失敗しました！",
  },
  TransactionCompletei18n: {
    en: "Transaction Complete!",
    ja: "取引完了しました！",
  },
  TheTransactionWasSuccessfullyCompletedi18n: {
    en: "The transaction was successfully completed!",
    ja: "取引が正常に完了しました！",
  },
  CartReportedi18n: {
    en: "Cart Report",
    ja: "カードレポート",
  },
  SuccesfullySentACartReporti18n: {
    en: "Successfully sent a cart report!",
    ja: "カードレポートを送信しました！",
  },
  SuccessfullyAddedTheProducti18n: {
    en: "Successfully added a product",
    ja: "製品を正常に追加しました！",
  },
  Successi18n: {
    en: "Success",
    ja: "成功",
  },
  AllBranchi18n: {
    en: "All Branch",
    ja: "全店舗",
  },
  Cancelledi18n: {
    en: "Cancelled",
    ja: "キャンセル",
  },
  OnGoingi18n: {
    en: "On Going",
    ja: "進行中",
  },
  PleaseCompleteTheFormToEditTheSupplieri18n: {
    en: "Please complete the form to Edit the supplier",
    ja: "サプライヤーを編集するには、フォームを入力してください",
  },
  PleaseCompleteTheFormToAddASupplieri18n: {
    en: "Please complete the form to Add a supplier",
    ja: "ベンダーを追加するにはフォームに記入してください",
  },
  AddingProductUnsuccessfuli18n: {
    en: "Adding product unsuccessful",
    ja: "製品の追加に失敗しました",
  },
  ThereWasAnErrorAddingProductPleaseTryAgainLateri18n: {
    en: "There was an error adding product, please try again later",
    ja: "製品の追加に失敗しました",
  },
  SuccessAddingProducti18n: {
    en: "Success adding product",
    ja: "製品の追加に成功しました",
  },
  SuccesfullyAddedProducti18n: {
    en: "Successfully added product",
    ja: "製品の追加に成功しました",
  },
  SuccesfullyConfirmedReceivedi18n: {
    en: "Successfully confirmed received",
    ja: "受け取り確認に成功しました",
  },
  AcceptTransferingStocki18n: {
    en: "Accept Transfering Stock",
    ja: "転送在庫を確認",
  },
  AreYouAbsolutelySureToAcceptTransferingStocki18n: {
    en: "Are you absolutely sure to accept transfering stock?",
    ja: "転送在庫を確認しますか？",
  },
  DenyStockTransferi18n: {
    en: "Deny Stock Transfer",
    ja: "転送在庫を拒否",
  },
  AreYouAbsolutelySureToDenyTransferingStocki18n: {
    en: "Are you sure you want to deny this stock transfer request? This action cannot be undone",
    ja: "転送在庫を拒否しますか？この操作は取り消せません。",
  },
  MarkTransferStockAsReceivedi18n: {
    en: "Mark Transfer Stock As Received",
    ja: "転送在庫を受け取り済みにする",
  },
  AreYouAbsolutelySureToMarkThisAsReceiveThisActionCannotBeUndonei18n: {
    en: "Are you absolutely sure to mark this as receive? This action cannot be undone.",
    ja: "この転送在庫を受け取り済みにしますか？この操作は取り消せません。",
  },
  PickASourceBranchi18n: {
    en: "Select a source branch",
    ja: "転送元の店舗を選択",
  },
  PickABranchToTransferFromAndModifyQuantityIfNeededi18n: {
    en: "Pick a branch to transfer from and modify quantity if needed",
    ja: "転送元の店舗と転送量を修正してください",
  },
  DenyStockTransferRequesti18n: {
    en: "Deny Stock Transfer Request",
    ja: "転送在庫リクエストを拒否",
  },
  AreYouAbsolutelySureToDenyTransferStockRequesti18n: {
    en: "Are you sure you want to deny this stock transfer request? This action cannot be undone.",
    ja: "転送在庫を拒否しますか？この操作は取り消せません。",
  },
  ReProcessStockTransferi18n: {
    en: "Re-Process Stock Transfer",
    ja: "転送在庫を再処理",
  },
  AreYouAbsolutelySureToReProcessTransferStockRequesti18n: {
    en: "Are you absolutely sure to re-process transfer stock request?",
    ja: "転送在庫リクエストを再処理しますか？",
  },
  TransferPermittedi18n: {
    en: "Transfer Permitted",
    ja: "転送可",
  },
  SuccesfullyPermittedCartContentTransferi18n: {
    en: "Successful permission granted for cart content transfer.",
    ja: "転送可",
  },
  DoYouWantToAllowThisCartToTransferItsTransactionsi18n: {
    en: "Do you want to allow this cart to transfer its transactions?",
    ja: "このカードを転送しますか？",
  },
  SuccesfullyAddedNewPromoi18n: {
    en: "Successfully added new promo",
    ja: "新しいプロモーションを追加しました",
  },
  SuccesfullyEditedPromoi18n: {
    en: "Successfully updated and saved the new promo",
    ja: "プロモーションを更新して保存しました",
  },
  Failedi18n: {
    en: "Failed",
    ja: "失敗",
  },
  PleaseUseADifferentPromoCodei18n: {
    en: "Please use a different promo code",
    ja: "別のプロモーションコードを使用してください",
  },
  SuccesfullyDeletedPromoi18n: {
    en: "Successfully deleted promo",
    ja: "削除しました",
  },
  TINNumber: {
    en: "TIN Number",
    ja: "TIN番号",
  },
  TINNumberFormatErrorMsg: {
    en: "Please enter a valid TIN.",
    ja: "有効な TIN を入力してください。",
  },
  AddCategory: {
    en: "Add Category",
    ja: "カデゴリーを追加",
  },
  EditCategory: {
    en: "Edit Category",
    ja: "カデゴリーを編集",
  },
  CategoryName: {
    en: "Category Name",
    ja: "カデゴリー名",
  },
  Update: {
    en: "Update",
    ja: "更新",
  },
  DeleteCategory: {
    en: "Delete Category",
    ja: "カデゴリーを削除",
  },
  DeleteCategoryDeleteMsg: {
    en: "Are you sure you want to delete this record?",
    ja: "このレコードを削除しますか？",
  },
  BatchNo: {
    en: "Batch Number",
    ja: "バッチ番号",
  },

  CurrencyMarker: {
    en: "₱",
    ja: "¥",
  },

  InventoryI18n: {
    en: "Inventory",
    ja: "在庫",
  },

  PurchasePrice: {
    en: "Purchase Price",
    ja: "購入価格",
  },

  RetailPrice: {
    en: "Retail Price",
    ja: "小売価格",
  },

  Deliveries: {
    en: "Deliveries",
    ja: "出荷",
  },

  Availability: {
    en: "Availability",
    ja: "利用可能性",
  },

  SupplierContactInfo: {
    en: "Supplier Contact Information",
    ja: "仕入先連絡先情報",
  },

  ConfirmDeletion: {
    en: "Confirm Deletion",
    ja: "削除を確認",
  },

  ConfirmDeleteMessage: {
    en: "This action cannot be undone and will permanently delete this record from our servers.",
    ja: "このアクションは元に戻せません。このレコードをサーバーから削除します。",

  },
  ConfirmDeleteMessageCategory: {
    en: (category: string) =>
      `Are you sure you want to delete this record? [${category}]`,
    ja: (category: string) =>
      `このレコードを削除してもよろしいですか？ [${category}]`,
  },

  Request: {
    en: "Request",
    ja: "リクエスト",
  },
}));
export interface I18nStore {
  locale: locale;
  localeExtended: LocalExtended;
  localeName: LocalizedString;
  setLocale: (value: locale) => void;
  /* Dashboard */
  salesOverviewi18n: LocalizedString;
  storeActivityi18n: LocalizedString;
  topSellingProducti18n: LocalizedString;
  leastSellingProducti18n: LocalizedString;
  cartsi18n: LocalizedString;

  /* Inventory */
  InventoryI18n: LocalizedString;
  LowStockLvli18n: LocalizedString;
  CriticalStockLvli18n: LocalizedString;

  CreatedSincei18n: LocalizedString;
  ContactNumberi18n: LocalizedString;
  FullNamei18n: LocalizedString;
  BranchListi18n: LocalizedString;
  AddBranchi18n: LocalizedString;
  Loadingi18n: LocalizedString;
  ActualWeighti18n: LocalizedString;
  Barcodei18n: LocalizedString;
  ProdWeighti18n: LocalizedString;
  NetWeighti18n: LocalizedString;
  Gramsi18n: LocalizedString;
  Previousi18n: LocalizedString;
  Nexti18n: LocalizedString;
  TransferStocki18n: TransferStock;
  ProdNamei18n: LocalizedString;
  Pricei18n: LocalizedString;
  ThresValuei18n: LocalizedString;
  Availi18n: LocalizedString;
  Expiryi18n: LocalizedString;
  Quantityi18n: LocalizedString;
  Actioni18n: LocalizedString;
  Statusi18n: LocalizedString;
  Batteryi18n: LocalizedString;
  Reporti18n: LocalizedString;
  Pagei18n: LocalizedString;
  Ofi18n: LocalizedString;
  Reseti18n: LocalizedString;
  Tablei18n: LocalizedString;
  Categoryi18n: LocalizedString;
  Uniti18n: LocalizedString;
  Producti18n: LocalizedString;
  Addi18n: LocalizedString;
  Editi18n: LocalizedString;
  Downloadi18n: LocalizedString;
  Datai18n: LocalizedString;
  Searchi18n: LocalizedString;
  PickADatei18n: LocalizedString;
  Uploadi18n: LocalizedString;
  Imagei18n: LocalizedString;
  NBTitle: LocalizedString;
  Viewi18n: LocalizedString;
  SetDateRangei18n: LocalizedString;
  DateTimei18n: LocalizedString;
  Customeri18n: LocalizedString;
  Customersi18n: LocalizedString;
  Notesi18n: LocalizedString;
  Transactioni18n: LocalizedString;
  Useri18n: LocalizedString;
  Salesi18n: LocalizedString;
  Profiti18n: LocalizedString;
  IDi18n: LocalizedString;
  Revenuei18n: LocalizedString;
  TransactionHistoryi18n: LocalizedString;
  TransactionTypei18n: LocalizedString;
  UserActivityi18n: LocalizedString;
  Activityi18n: LocalizedString;
  Logouti18n: LocalizedString;
  Settingsi18n: LocalizedString;
  Emaili18n: LocalizedString;
  Passwordi18n: LocalizedString;
  Registeri18n: LocalizedString;
  PromoCodei18n: LocalizedString;
  Supplieri18n: LocalizedString;
  Contacti18n: LocalizedString;
  ContactPersoni18n: LocalizedString;
  SupplierNamei18n: LocalizedString;
  AddProducti18n: LocalizedString;
  ProductSuppliedi18n: LocalizedString;
  Submiti18n: LocalizedString;
  ProductListi18n: LocalizedString;
  Deletei18n: LocalizedString;
  AddSupplieri18n: LocalizedString;
  SupplierProfilei18n: LocalizedString;
  AddStorei18n: LocalizedString;
  StoreListi18n: LocalizedString;
  Removei18n: LocalizedString;
  CreateOTAi18n: LocalizedString;
  Namei18n: LocalizedString;
  Percentagei18n: LocalizedString;
  PromoProducti18n: LocalizedString;
  PromoListi18n: LocalizedString;
  AlertDialogue1i18n: LocalizedString;
  AlertDialogue2i18n: LocalizedString;
  Canceli18n: LocalizedString;
  AddPromoi18n: LocalizedString;
  Continuei18n: LocalizedString;
  PrimaryDetailsi18n: LocalizedString;
  SupplierDetailsi18n: LocalizedString;
  ProductIDi18n: LocalizedString;
  OpeningStocksi18n: LocalizedString;
  RemainingStocksi18n: LocalizedString;
  ThresholStockValuei18n: LocalizedString;
  StoreNamei18n: LocalizedString;
  StockInHandi18n: LocalizedString;
  Purchasesi18n: LocalizedString;
  StockLocationi18n: LocalizedString;
  Overviewi18n: LocalizedString;
  BranchNamei18n: LocalizedString;
  PurchaseDatei18n: LocalizedString;
  QuantitySoldi18n: LocalizedString;
  TotalCosti18n: LocalizedString;
  Savei18n: LocalizedString;
  Carti18n: LocalizedString;
  EnterEmaili18n: LocalizedString;
  AddStoreMsgi8n: LocalizedString;
  StoreNamei8n: LocalizedString;
  AddStoreNamei8n: LocalizedString;
  Addressi8n: LocalizedString;
  AddAddressi8n: LocalizedString;
  ContactNumberi8n: LocalizedString;
  AddContactNumberi8n: LocalizedString;
  ContactPersoni8n: LocalizedString;
  AddContactPersoni8n: LocalizedString;
  AddStorei8n: LocalizedString;
  CompanyIdi8n: LocalizedString;
  AddCompanyIdi8n: LocalizedString;
  TransactionStatusi18n: LocalizedString;
  ReferenceNumberi18n: LocalizedString;
  InUsei18n: LocalizedString;
  LowBatteryi18n: LocalizedString;
  Availablei18n: LocalizedString;
  Chargingi18n: LocalizedString;
  Maintenancei18n: LocalizedString;
  ClientListi18n: LocalizedString;
  Discounti18n: LocalizedString;
  SelectPromoNamei18n: LocalizedString;
  SelectCategoryi18n: LocalizedString;
  EnterPercDisci18n: LocalizedString;
  EnterPromoCodei18n: LocalizedString;
  Companyi18n: LocalizedString;
  Branchi18n: LocalizedString;
  ProductSoldi18n: LocalizedString;
  Gainsi18n: LocalizedString;
  ActivePromoi18n: LocalizedString;
  CartIssuesi18n: LocalizedString;
  NewProductsi18n: LocalizedString;
  Soldi18n: LocalizedString;
  SeeAlli18n: LocalizedString;
  Stocksi18n: LocalizedString;
  AddStocksi18n: LocalizedString;
  ReStockImmediatelyi18n: LocalizedString;
  RequestTransferi18n: LocalizedString;
  DateIssuedi18n: LocalizedString;
  DateReceivedi18n: LocalizedString;
  ReceiverBranchi18n: LocalizedString;
  SenderBranchi18n: LocalizedString;
  AddReporti18n: LocalizedString;
  UnusualTransactioni18n: LocalizedString;
  CartIDi18n: LocalizedString;
  Remarksi18n: LocalizedString;
  Datei18n: LocalizedString;
  SalesReporti18n: LocalizedString;
  Itemsi18n: LocalizedString;
  AllowTransferi18n: LocalizedString;
  CustomerListi18n: LocalizedString;
  AddGuesti18n: LocalizedString;
  PromoNamei18n: LocalizedString;
  SelectAUniti18n: LocalizedString;
  AddTransferStocksi18n: LocalizedString;
  Confirmi18n: LocalizedString;
  SelectProducti18n: LocalizedString;
  Closei18n: LocalizedString;
  AddReportForCartIDi18n: LocalizedString;
  EnterReporti18n: LocalizedString;
  CreateGuestAccounti18n: LocalizedString;
  CreateANewGuestOrOneTimeAccount: LocalizedString;
  EnterPromoNamei18n: LocalizedString;
  SelectProductsIncludedToThePromoi18n: LocalizedString;
  PleaseSelectACompanyOrABranchi18n: LocalizedString;
  SupplierListi18n: LocalizedString;
  SelectCompanyi18n: LocalizedString;
  ScanQRCodei18n: LocalizedString;
  ScanAgaini18n: LocalizedString;
  TotalPricei18n: LocalizedString;
  SubTotali18n: LocalizedString;
  Paymenti18n: LocalizedString;
  AreYouAbsolutelySurei18n: LocalizedString;
  ThisActionCannotBeUndoneThisWillPermanentlyDeleteYourAccountAndRemoveYourDataFromOurServersi18n: LocalizedString;
  GoBacki18n: LocalizedString;
  CardPaymenti18n: LocalizedString;
  CashPaymenti18n: LocalizedString;
  PleaseEnterYourCardDetailsi18n: LocalizedString;
  CardNumberi18n: LocalizedString;
  PleaseEnterExactCashAmounti18n: LocalizedString;
  TenderAmounti18n: LocalizedString;
  AmountToPayi18n: LocalizedString;
  ValidThrui18n: LocalizedString;
  Resolvei18n: LocalizedString;
  Resolvedi18n: LocalizedString;
  Unresolvedi18n: LocalizedString;
  Accidentali18n: LocalizedString;
  EditSupplieri18n: LocalizedString;
  Hoveri18n: LocalizedString;
  Expiredi18n: LocalizedString;
  Activei18n: LocalizedString;
  Changei18n: LocalizedString;
  YourChangeIsi18n: LocalizedString;
  Proceedi18n: LocalizedString;
  PaymentSuccessfuli18n: LocalizedString;
  PaymentFailedi18n: LocalizedString;
  TransactionCompletei18n: LocalizedString;
  TheTransactionWasSuccessfullyCompletedi18n: LocalizedString;
  CartReportedi18n: LocalizedString;
  SuccesfullySentACartReporti18n: LocalizedString;
  SuccessfullyAddedTheProducti18n: LocalizedString;
  Successi18n: LocalizedString;
  AllBranchi18n: LocalizedString;
  Cancelledi18n: LocalizedString;
  OnGoingi18n: LocalizedString;
  PleaseCompleteTheFormToEditTheSupplieri18n: LocalizedString;
  PleaseCompleteTheFormToAddASupplieri18n: LocalizedString;
  AddingProductUnsuccessfuli18n: LocalizedString;
  ThereWasAnErrorAddingProductPleaseTryAgainLateri18n: LocalizedString;
  SuccessAddingProducti18n: LocalizedString;
  SuccesfullyAddedProducti18n: LocalizedString;
  SuccesfullyConfirmedReceivedi18n: LocalizedString;
  AcceptTransferingStocki18n: LocalizedString;
  AreYouAbsolutelySureToAcceptTransferingStocki18n: LocalizedString;
  DenyStockTransferi18n: LocalizedString;
  AreYouAbsolutelySureToDenyTransferingStocki18n: LocalizedString;
  MarkTransferStockAsReceivedi18n: LocalizedString;
  AreYouAbsolutelySureToMarkThisAsReceiveThisActionCannotBeUndonei18n: LocalizedString;
  PickASourceBranchi18n: LocalizedString;
  PickABranchToTransferFromAndModifyQuantityIfNeededi18n: LocalizedString;
  DenyStockTransferRequesti18n: LocalizedString;
  AreYouAbsolutelySureToDenyTransferStockRequesti18n: LocalizedString;
  ReProcessStockTransferi18n: LocalizedString;
  AreYouAbsolutelySureToReProcessTransferStockRequesti18n: LocalizedString;
  TransferPermittedi18n: LocalizedString;
  SuccesfullyPermittedCartContentTransferi18n: LocalizedString;
  DoYouWantToAllowThisCartToTransferItsTransactionsi18n: LocalizedString;
  SuccesfullyAddedNewPromoi18n: LocalizedString;
  SuccesfullyEditedPromoi18n: LocalizedString;
  Failedi18n: LocalizedString;
  PleaseUseADifferentPromoCodei18n: LocalizedString;
  SuccesfullyDeletedPromoi18n: LocalizedString;
  TINNumber: LocalizedString;
  TINNumberFormatErrorMsg: LocalizedString;
  AddCategory: LocalizedString;
  EditCategory: LocalizedString;
  CategoryName: LocalizedString;
  Update: LocalizedString;
  DeleteCategory: LocalizedString;
  DeleteCategoryDeleteMsg: LocalizedString;
  BatchNo: LocalizedString;
  CurrencyMarker: LocalizedString;
  PurchasePrice: LocalizedString;
  RetailPrice: LocalizedString;
  Deliveries: LocalizedString;
  Availability: LocalizedString;
  SupplierContactInfo: LocalizedString;
  ConfirmDeletion: LocalizedString;
  ConfirmDeleteMessage: LocalizedString;
  ConfirmDeleteMessageCategory: {
    en: (category: string) => string;
    ja: (category: string) => string;
  };
  Request: LocalizedString;
}
