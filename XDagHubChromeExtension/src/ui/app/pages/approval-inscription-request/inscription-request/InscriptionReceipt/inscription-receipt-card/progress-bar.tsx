
const ProgressBar = ({ progress }: { progress: number }) => {
    return (
        <div className="w-full bg-gray-55 rounded-full h-3">
            <div className=" bg-sui-bright h-3 rounded-full"
                style={{ width: `${progress}%` }}
            ></div>
        </div>
    );
};

export default ProgressBar;
