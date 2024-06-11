import PropTypes from 'prop-types';

const ProgressCircle = ({ progress, size }: { progress: number, size: number }) => {
    const radius = (size - 10) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <svg width={size} height={size}>
            <circle
                stroke="gray"
                fill="transparent"
                strokeWidth="10"
                r={radius}
                cx={size / 2}
                cy={size / 2}
            />
            <circle
                stroke="blue"
                fill="transparent"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                r={radius}
                cx={size / 2}
                cy={size / 2}
                style={{ transition: 'stroke-dashoffset 0.35s' }}
            />
            <text
                x="50%"
                y="50%"
                dominantBaseline="middle"
                textAnchor="middle"
                fontSize="20px"
                fill="black"
            >
                {`${progress}%`}
            </text>
        </svg>
    );
};

ProgressCircle.propTypes = {
    progress: PropTypes.number.isRequired,
    size: PropTypes.number.isRequired,
};

export default ProgressCircle;
