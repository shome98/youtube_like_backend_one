import { Schema } from "mongoose";

const subscriptionSchema = new Schema({
    //the person that is subscribing
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    //the channel or person subscribed to
    channel: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
})
export const Subscription = mongoose.model("Subscription", subscriptionSchema)