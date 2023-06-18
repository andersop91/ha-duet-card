import React, {useEffect, useState} from "react";
import {HassEntity} from "home-assistant-js-websocket";
import {ThreedyCondition, ThreedyConfig} from "../../types";
import Stat from "./Stat";
import moment from 'moment';

const formatDuration = (
    time: number,
    round: boolean
) => {
    return (
        round ? moment.duration(time, "seconds").humanize() : (() => {

            const t = moment.duration(time, 'seconds');

            const d = t.days();
            const h = t.hours();
            const m = t.minutes();
            const s = t.seconds();


            return `${d > 0 ? `${d}d` : ''}${h > 0 ? ` ${h}h` : ''}${m > 0 ? ` ${m}m` : ''}${s > 0 ? ` ${s}s` : ''}`

        })()
    )
}

const renderTime = (
    time: number,
    condition: ThreedyCondition,
    config: ThreedyConfig
) => {

    const r = config.round_time;

    switch (condition) {
        case ThreedyCondition.Remaining:
            return formatDuration(time, r)
        case ThreedyCondition.ETA:
            return moment().add(time, 'seconds').format(config.use_24hr ? "HH:mm" : "h:mm a")
        case ThreedyCondition.Elapsed:
            return formatDuration(time, r)
        default:
            return '<unknown>'
    }
}

const getTotalSeconds = (
    timeEntity: HassEntity,
    config: ThreedyConfig
) => { 
        return timeEntity.state*60;
}


type TimeStatProps = {
    timeEntity: HassEntity,
    condition: ThreedyCondition
    config: ThreedyConfig,
    direction: number
    status: string
}

const TimeStat: React.FC<TimeStatProps> = ({timeEntity, condition, config, direction, status}) => {
    const totalSeconds = getTotalSeconds(timeEntity, config);
    const [ time, setTime ] = useState<number>(totalSeconds);
    const [ lastIntervalId, setLastIntervalId ] = useState<number>(-1);

    const incTime = () => setTime( time => (parseInt(time) + parseInt(direction)) );
    //TODO CHANGE THIS AFTER DEBUG (should be !=)
    const showEmpty = status != "processing";
    console.log("Shows empty: ", status);

    useEffect(() => {

        if (lastIntervalId !== -1) clearInterval(lastIntervalId);

        setTime(getTotalSeconds(timeEntity, config));

        const id = setInterval(
            incTime,
            1000
        );

        setLastIntervalId(id);

    }, [timeEntity]);

    return (
        <Stat
            name={condition}
            value={ showEmpty ? "-" : renderTime(time, condition, config )}
        />
    )


}

export default TimeStat;
