import React from "react";

const HomePost = () => {
	return (
		<div className="w-full flex mt-8 space-x-4">
			{/* left */}
			<div className="w-[30%] h-[250px] flex justify-center items-center">
				<img
					src="https://miro.medium.com/v2/resize:fit:828/format:webp/1*_LG3GFDIi8Ro-ReV2F5_sA.jpeg"
					alt=""
					className="h-full w-full object-cover"
				/>
			</div>
			{/*right */}
			<div className="flex flex-col w-[65%] ">
				<h1 className="text-xl font-bold md:mb-2 mb-1 md:text-2xl">
					10 Uses of Artificial Intelligence in Day to Day Life
				</h1>
				<div className="flex mb-2 text-sm font-semibold text-gray-500 items-center justify-between sm:mb-4">
					<p>@Luke</p>
					<div className="flex-space-x-2">
						<p>9/1/2024</p>
						<p>11:07</p>
					</div>
				</div>
				<p className="text-sm md:text-md">
					Virtual assistants have become our digital companions. Siri, Google
					Assistant, and Alexa are household names that rely on AI to understand
					and respond to voice commands. 
				</p>
			</div>
		</div>
	);
};

export default HomePost;
