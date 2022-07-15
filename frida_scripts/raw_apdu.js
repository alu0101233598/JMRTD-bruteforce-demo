console.log('[+] Frida hooked up!');
Java.perform(function() {
  // Dump content of APDUs
  let senderClass = Java.use('org.jmrtd.protocol.SecureMessagingAPDUSender');
  senderClass.transmit.implementation = function(wrapper, commandAPDU) {
    let responseAPDU = this.transmit(wrapper, commandAPDU);
    console.log(commandAPDU.toString());
    send('{"type": "command"}', new Uint8Array(commandAPDU.getBytes()));
    console.log(responseAPDU.toString());
    send('{"type": "response"}', new Uint8Array(responseAPDU.getBytes()));
    return responseAPDU;
  };

  // Log PACE protocol
  let paceProtocolClass = Java.use('org.jmrtd.protocol.PACEProtocol');
  paceProtocolClass.doPACE.overload('org.jmrtd.AccessKeySpec',
      'javax.crypto.SecretKey', 'java.lang.String', 'java.security.spec.AlgorithmParameterSpec',
      'java.math.BigInteger').implementation = function(a, b, c, d, e) {
    console.log('----- Start of PACE -----');
    let ret = this.doPACE(a, b, c, d, e);
    console.log('----- End of PACE -----');
    return ret;
  };
  paceProtocolClass.checkConsistency.implementation = function (agreementAlg, cipherAlg,
      digestAlg, keyLength, staticParameters) {
    console.log('[i] Agreement:', agreementAlg);
    console.log('[i] Cipiher algorithm:', cipherAlg);
    console.log('[i] Digest algorithm', digestAlg);
    console.log('[i] Key length:', keyLength);
    return this.checkConsistency(agreementAlg, cipherAlg, digestAlg, keyLength, staticParameters);
  };
  let paceInfoClass = Java.use('org.jmrtd.lds.PACEInfo');
  paceInfoClass.toMappingType.implementation = function(oid) {
    let ret = this.toMappingType(oid);
    console.log('[i] Mapping type:', ret);
    return ret;
  }; 

  let loggerClass = Java.use('java.util.logging.Logger');
  loggerClass.warning.overload('java.lang.String').implementation = function(a) {
    console.log('[W]', a);
    return this.warning(a);
  };
});