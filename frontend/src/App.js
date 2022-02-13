import "./App.scss";
import MainPage from "./veiws/mainPage";
import { Canvas, useThree, useFrame, extend } from "@react-three/fiber";
import * as THREE from "three";
import {
	OrbitControls,
	Stars,
	Sky,
	PerspectiveCamera,
	FlyControls,
} from "@react-three/drei";
import CameraControls from "camera-controls";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useMemo, useRef } from "react";

import { Physics, useBox, usePlane } from "@react-three/cannon";
import { Vector2 } from "three";
import { Vector3 } from "three";
CameraControls.install({ THREE });
extend({ FlyControls });
function Box({ pos, size, onClick }) {
	const [ref, api] = useBox(() => ({ mass: 1, position: pos }));

	return (
		<mesh position={[10, 20, 20]} onClick={onClick} ref={ref}>
			<boxBufferGeometry attach="geometry" args={size}>
				{" "}
			</boxBufferGeometry>
			<meshStandardMaterial
				attach="material"
				color="hotpink"></meshStandardMaterial>
		</mesh>
	);
}
function Controls({ look = new THREE.Vector3() }) {
	const camera = useThree((state) => state.camera);
	const gl = useThree((state) => state.gl);
	const controls = useMemo(() => new CameraControls(camera, gl.domElement), []);
	return useFrame((state, delta) => {
		state.camera.lookAt(look);
	});
}

function MoveCamera() {
	const { camera } = useThree();
	const ref = useRef();
	useFrame((state, delta) => {
		ref.current.update(delta);
	});
	return (
		<FlyControls
			ref={ref}
			args={[camera]}
			movementSpeed={20.0}
			dragToLook={false}
		/>
	);
}
const toastySuccess = (message) => {
	toast(`🦄 ${message}`, {
		position: "top-right",
		autoClose: 5000,
		hideProgressBar: false,
		closeOnClick: true,
		pauseOnHover: true,
		draggable: true,
		progress: undefined,
	});
	console.log("Showing The Toasty");
};
function Plane() {
	const [ref, api] = usePlane(() => ({
		mass: 0,
		rotation: [-Math.PI / 2, 0, 0],
	}));

	return (
		<mesh position={[0, -4, 0]} rotation={[-Math.PI / 2, 0, 0]} ref={ref}>
			<planeBufferGeometry
				attach="geometry"
				args={[200, 160, 100]}></planeBufferGeometry>
			<meshStandardMaterial
				attach="material"
				color="lightblue"></meshStandardMaterial>
		</mesh>
	);
}

function App() {
	// const camera = useThree((state) => state.camera);

	return (
		<>
			<ToastContainer
				position="top-right"
				autoClose={5000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
			/>
			<Canvas camera={{ position: [0, 10, 50] }}>
				<OrbitControls />
				<Sky></Sky>
				<Stars
					radius={100} // Radius of the inner sphere (default=100)
					depth={50} // Depth of area where stars should fit (default=50)
					count={5000} // Amount of stars (default=5000)
					factor={4} // Size factor (default=4)
					saturation={0} // Saturation 0-1 (default=0)
					fade // Faded dots (default=false)
				/>{" "}
				<ambientLight intensity={0.5} />
				<Physics>
					<Plane />
					<Box
						size={[10, 10, 40]}
						pos={[10, 10, 10]}
						onClick={() => {
							toastySuccess("yess it has been transfered to your account");
						}}
					/>
					<Box size={[10, 10, 3]} pos={[50, 10, 10]} />
					<Box size={[10, 10, 3]} pos={[50, 10, 10]} />
					<Box size={[10, 10, 3]} pos={[80, 10, 10]} />
					<Box size={[10, 10, 3]} pos={[-50, 10, 10]} />
					<Box size={[10, 10, 3]} pos={[-60, 10, 10]} />
				</Physics>
				<Controls look={new Vector3(0, -10, 0)} />
				<MoveCamera />
			</Canvas>
		</>
	);
}

export default App;
