import PaceToTime from "./components/PaceToTime";
import TimeToPace from "./components/TimeToPace";

export default function App() {
  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 shadow-md rounded-lg w-full min-w-48 max-w-lg">
        <PaceToTime />
        <hr className="my-8" />
        <TimeToPace />
      </div>
    </div>
  );
}
