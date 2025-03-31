import TermsAndConditionsScreen from "../src/screens/provider/TermsAndConditionsScreen";
import ProviderEditProfileScreen from "../src/screens/provider/profile/ProviderEditProfileScreen";
import VerificationStatusScreen from "../src/screens/provider/profile/VerificationStatusScreen";
// import HelpSupportScreen from "../src/screens/provider/profile/HelpSupportScreen";
import MyAvailabilityScreen from "../src/screens/provider/profile/MyAvailabilityScreen";
import ProviderSettings from "../src/screens/provider/profile/ProviderSettings";
import BookingHelpScreen from "../src/screens/provider/profile/BookingHelpScreen";
import AddServicesScreen from "../src/screens/provider/profile/AddServicesScreen";
import BusinessHoursScreen from "../src/screens/provider/profile/BusinessHoursScreen";
import ViewShopScreen from "../src/screens/provider/home/ShopScreen";
import MainDashboard from "../src/screens/provider/MainDashboard";
import TransactionsScreen from "../src/screens/provider/profile/TransactionsScreen";
import BusinessDocumentsScreen from "../src/screens/provider/ShopDocuments/BusinessDocumentsScreen";
import ProviderHelpSupportScreen from "../src/screens/provider/profile/ProviderHelpAndSupportScreen";
import PayBillsScreen from "../src/screens/provider/profile/PayBillsScreen";
import AddGCashPaymentMethod from "../src/screens/provider/profile/AddGCashPaymentMethod";
import AddGaleryScreen from "../src/screens/provider/profile/AddGaleryScreen";

export const Providers = (Stack) => (
  <>
    <Stack.Screen
      name="TermsAndConditions"
      component={TermsAndConditionsScreen}
    />
    <Stack.Screen name="Main" component={MainDashboard} />
    <Stack.Screen name="EditProfile" component={ProviderEditProfileScreen} />
    <Stack.Screen name="Transactions" component={TransactionsScreen} />
    <Stack.Screen
      name="VerificationStatus"
      component={VerificationStatusScreen}
    />
    <Stack.Screen name="HelpAndSupport" component={ProviderHelpSupportScreen} />
    <Stack.Screen name="MyAvailability" component={MyAvailabilityScreen} />
    <Stack.Screen name="Settings" component={ProviderSettings} />
    <Stack.Screen name="BookingHelpScreen" component={BookingHelpScreen} />
    <Stack.Screen name="AddServices" component={AddServicesScreen} />
    <Stack.Screen
      name="BusinessDocuments"
      component={BusinessDocumentsScreen}
    />
    <Stack.Screen name="BusinessHours" component={BusinessHoursScreen} />
    <Stack.Screen name="Shop" component={ViewShopScreen} />
    <Stack.Screen name="PayBills" component={PayBillsScreen} />
    <Stack.Screen name="AddGallery" component={AddGaleryScreen} />
    <Stack.Screen
      name="AddGCashPaymentMethod"
      component={AddGCashPaymentMethod}
    />
  </>
);
