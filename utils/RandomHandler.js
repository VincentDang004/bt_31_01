
module.exports = {
    GenToken: function (length) {
        let result = "";
        let source = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < length; i++) {
            if (!(i % 4) && i > 0) {
                result += '-';
            }
            let ran = Math.floor(Math.random() * source.length);
            result += source.charAt(ran);
        }
        return result;
    }
}