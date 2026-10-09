import test from 'node:test';
import assert from 'node:assert/strict';
import {emailOk,passwordOk,otpOk,ratingOk,reviewOk,fssaiOk,phoneOk} from '../utils/validation.js';

test('email validation accepts valid email and rejects malformed email',()=>{assert.equal(emailOk('user@example.com'),true);assert.equal(emailOk('user@'),false);assert.equal(emailOk(''),false)});
test('password validation enforces 8-128 characters',()=>{assert.equal(passwordOk('12345678'),true);assert.equal(passwordOk('1234567'),false);assert.equal(passwordOk('x'.repeat(129)),false)});
test('OTP validation requires exactly six digits',()=>{assert.equal(otpOk('123456'),true);assert.equal(otpOk('12345'),false);assert.equal(otpOk('12a456'),false)});
test('rating validation allows only 1 through 5',()=>{for(const n of [1,2,3,4,5])assert.equal(ratingOk(n),true);for(const n of [0,6,3.5])assert.equal(ratingOk(n),false)});
test('review validation enforces 3-500 characters',()=>{assert.equal(reviewOk('Good food'),true);assert.equal(reviewOk('No'),false);assert.equal(reviewOk('x'.repeat(501)),false)});
test('FSSAI validation requires exactly 14 digits',()=>{assert.equal(fssaiOk('12345678901234'),true);assert.equal(fssaiOk('1234'),false)});
test('phone validation accepts common formats',()=>{assert.equal(phoneOk('+91 9876543210'),true);assert.equal(phoneOk('abc'),false);assert.equal(phoneOk(''),true)});
