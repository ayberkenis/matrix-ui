import MatrixRainBackground from "../../../components/MatrixRainBackground";
import LiveStreamBridge from "../../../components/LiveStreamBridge";
import SplashScreen from "../../../components/SplashScreen";

export default function MatrixLayout({ children }) {
  return (
    <div className="min-h-screen bg-matrix-darker relative overflow-hidden">
      <SplashScreen />
      <MatrixRainBackground />
      <div className="relative z-10">
        <LiveStreamBridge />
        {children}
      </div>
    </div>
  );
}
