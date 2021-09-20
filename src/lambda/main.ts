import Bet from "./Bet";
import createBet from "./createBet";
import deleteBet from "./deleteBet";
import getBetById from "./getBetById";
import listBets from "./listBets";
import updateBet from "./updateBet";

type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        betId: string,
        bet: Bet
    }
}

exports.handler = async (event:AppSyncEvent) => {
    switch (event.info.fieldName) {
        case "getBetById":
            return await getBetById(event.arguments.betId);
        case "createBet":
            return await createBet(event.arguments.bet);
        case "listBets":
            return await listBets();
        case "deleteBet":
            return await deleteBet(event.arguments.betId);
        case "updateBet":
            return await updateBet(event.arguments.bet);
        default:
            return null;
    }
}
