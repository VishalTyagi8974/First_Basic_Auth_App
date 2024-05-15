const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "username can not be blank."]
    },
    password: {
        type: String,
        required: [true, "password can not be blank."]
    }
})

userSchema.statics.findUserAndValidate = async function (username, password) {
    const user = await this.findOne({ username });
    if (user) {
        const validate = await bcrypt.compare(password, user.password);
        if (validate) {
            return user;
        }
    }
    return false
}
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 12);
    return next();
})
const User = mongoose.model("User", userSchema);

module.exports = User;