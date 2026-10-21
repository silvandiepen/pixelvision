/*! @license
 * Faces in profile (OpenCV haarcascade_profileface, David Bradley).
 * Converted from OpenCV by js-objectdetect (MIT, (c) 2014 Martin Tschirsich) and jsfeat
 * (MIT, (c) 2012 Eugene Zatepyakin). Original licence:
 *
 * ### objectdetect.profileface.js ###
 *
 * 20x20 profile face detector. Contributed by David Bradley from Princeton University.
 *
 *   IMPORTANT: READ BEFORE DOWNLOADING, COPYING, INSTALLING OR USING.
 *
 *   By downloading, copying, installing or using the software you agree to this license.
 *   If you do not agree to this license, do not download, install,
 *   copy or use the software.
 *
 *
 *                         Intel License Agreement
 *                 For Open Source Computer Vision Library
 *
 *  Copyright (C) 2000, Intel Corporation, all rights reserved.
 *  Third party copyrights are property of their respective owners.
 *
 *  Redistribution and use in source and binary forms, with or without modification,
 *  are permitted provided that the following conditions are met:
 *
 *    * Redistribution's of source code must retain the above copyright notice,
 *      this list of conditions and the following disclaimer.
 *
 *    * Redistribution's in binary form must reproduce the above copyright notice,
 *      this list of conditions and the following disclaimer in the documentation
 *      and/or other materials provided with the distribution.
 *
 *    * The name of Intel Corporation may not be used to endorse or promote products
 *      derived from this software without specific prior written permission.
 *
 *  This software is provided by the copyright holders and contributors "as is" and
 *  any express or implied warranties, including, but not limited to, the implied
 *  warranties of merchantability and fitness for a particular purpose are disclaimed.
 *  In no event shall the Intel Corporation or contributors be liable for any direct,
 *  indirect, incidental, special, exemplary, or consequential damages
 *  (including, but not limited to, procurement of substitute goods or services;
 *  loss of use, data, or profits; or business interruption) however caused
 *  and on any theory of liability, whether in contract, strict liability,
 *  or tort (including negligence or otherwise) arising in any way out of
 *  the use of this software, even if advised of the possibility of such damage.
 */
import type { HaarCascade } from "../detect/haar.model";

/** Faces in profile (OpenCV haarcascade_profileface, David Bradley). Use with `detectHaar`. */
export const profileFace: HaarCascade = {
  complexClassifiers: [
    {
      simpleClassifiers: [
        {
          features: [
            [8, 7, 2, 6, -1],
            [8, 10, 2, 3, 2],
          ],
          threshold: 0.001138439984060824,
          right_val: 0.7341383099555969,
          left_val: -0.8377197980880737,
        },
        {
          features: [
            [8, 3, 10, 7, -1],
            [13, 3, 5, 7, 2],
          ],
          threshold: -0.0113423503935337,
          right_val: -0.7239630222320557,
          left_val: 0.6270201802253723,
        },
        {
          features: [
            [10, 11, 3, 6, -1],
            [10, 14, 3, 3, 2],
          ],
          threshold: -0.001102308975532651,
          right_val: -0.6608840823173523,
          left_val: 0.3760018944740295,
        },
      ],
      threshold: -1.1856809854507446,
    },
    {
      simpleClassifiers: [
        {
          features: [
            [10, 4, 8, 8, -1],
            [14, 4, 4, 8, 2],
          ],
          threshold: -0.0195538699626923,
          right_val: -0.6339616775512695,
          left_val: 0.492458313703537,
        },
        {
          features: [
            [5, 7, 5, 4, -1],
            [5, 9, 5, 2, 2],
          ],
          threshold: 0.0022794529795646667,
          right_val: 0.3581846058368683,
          left_val: -0.6460496783256531,
        },
        {
          features: [
            [8, 4, 6, 6, -1],
            [8, 4, 3, 3, 2],
            [11, 7, 3, 3, 2],
          ],
          threshold: 0.002427044091746211,
          right_val: 0.2849431037902832,
          left_val: -0.4725323021411896,
        },
        {
          features: [
            [10, 14, 5, 2, -1],
            [10, 15, 5, 1, 2],
          ],
          threshold: 0.0019644061103463173,
          right_val: -0.7786815762519836,
          left_val: 0.1699953973293304,
        },
        {
          features: [
            [7, 11, 8, 4, -1],
            [7, 13, 8, 2, 2],
          ],
          threshold: 0.0022895270958542824,
          right_val: -0.6672509908676147,
          left_val: 0.1555171012878418,
        },
        {
          features: [
            [11, 14, 3, 3, -1],
            [11, 15, 3, 1, 3],
          ],
          threshold: -0.003014391055330634,
          right_val: 0.1460456997156143,
          left_val: -0.6872130036354065,
        },
        {
          features: [
            [3, 5, 3, 11, -1],
            [4, 5, 1, 11, 3],
          ],
          threshold: -0.0173990093171597,
          right_val: -0.1657290011644363,
          left_val: 0.7252438068389893,
        },
        {
          features: [
            [8, 7, 9, 6, -1],
            [8, 10, 9, 3, 2],
          ],
          threshold: 0.0009072244283743203,
          right_val: 0.2360499948263168,
          left_val: -0.4638808071613312,
        },
        {
          features: [
            [13, 12, 1, 2, -1],
            [13, 13, 1, 1, 2],
          ],
          threshold: -0.001504397951066494,
          right_val: 0.114369198679924,
          left_val: -0.7595962882041931,
        },
        {
          features: [
            [1, 3, 6, 17, -1],
            [4, 3, 3, 17, 2],
          ],
          threshold: 0.1080468967556953,
          right_val: 0.7909234166145325,
          left_val: -0.1286551952362061,
        },
        {
          features: [
            [11, 12, 1, 3, -1],
            [11, 13, 1, 1, 3],
          ],
          threshold: -0.0011923050042241812,
          right_val: 0.1484749019145966,
          left_val: -0.6240354776382446,
        },
        {
          features: [
            [1, 9, 6, 9, -1],
            [4, 9, 3, 9, 2],
          ],
          threshold: -0.0205713901668787,
          right_val: -0.2128700017929077,
          left_val: 0.408084899187088,
        },
      ],
      threshold: -1.4913179874420166,
    },
    {
      simpleClassifiers: [
        {
          features: [
            [10, 5, 8, 6, -1],
            [14, 5, 4, 6, 2],
          ],
          threshold: -0.036899209022522,
          right_val: -0.4087265133857727,
          left_val: 0.5330861806869507,
        },
        {
          features: [
            [7, 8, 9, 6, -1],
            [7, 10, 9, 2, 3],
          ],
          threshold: 0.0024960909504443407,
          right_val: 0.2712517976760864,
          left_val: -0.6948931217193604,
        },
        {
          features: [
            [5, 8, 6, 6, -1],
            [5, 8, 3, 3, 2],
            [8, 11, 3, 3, 2],
          ],
          threshold: 0.0002406803978374228,
          right_val: 0.2193035036325455,
          left_val: -0.5620825290679932,
        },
        {
          features: [
            [2, 0, 4, 18, -1],
            [4, 0, 2, 18, 2],
          ],
          threshold: -0.0580218285322189,
          right_val: -0.1508214026689529,
          left_val: 0.6906061768531799,
        },
        {
          features: [
            [10, 12, 3, 4, -1],
            [10, 14, 3, 2, 2],
          ],
          threshold: 0.0011526979506015778,
          right_val: -0.6631165742874146,
          left_val: 0.1392538994550705,
        },
        {
          features: [
            [7, 0, 3, 9, -1],
            [7, 3, 3, 3, 3],
          ],
          threshold: 0.007438844069838524,
          right_val: 0.3169938027858734,
          left_val: -0.3333317041397095,
        },
        {
          features: [
            [11, 13, 1, 3, -1],
            [11, 14, 1, 1, 3],
          ],
          threshold: -0.0014158539706841111,
          right_val: 0.1324332058429718,
          left_val: -0.6800730228424072,
        },
        {
          features: [
            [4, 8, 5, 2, -1],
            [4, 9, 5, 1, 2],
          ],
          threshold: 0.0008856271160766482,
          right_val: 0.1973295956850052,
          left_val: -0.3867216110229492,
        },
        {
          features: [
            [11, 13, 2, 3, -1],
            [11, 14, 2, 1, 3],
          ],
          threshold: 0.00257140607573092,
          right_val: -0.7317706942558289,
          left_val: 0.120356597006321,
        },
        {
          features: [
            [12, 12, 1, 3, -1],
            [12, 13, 1, 1, 3],
          ],
          threshold: 0.001825554994866252,
          right_val: -0.7719609141349792,
          left_val: 0.0779798403382301,
        },
        {
          features: [
            [9, 12, 2, 8, -1],
            [9, 16, 2, 4, 2],
          ],
          threshold: -0.0011993020307272673,
          right_val: -0.4147912859916687,
          left_val: 0.1682122945785523,
        },
        {
          features: [
            [6, 3, 4, 13, -1],
            [8, 3, 2, 13, 2],
          ],
          threshold: 0.023179080337286,
          right_val: -0.7104706764221191,
          left_val: 0.0753373205661774,
        },
        {
          features: [
            [2, 6, 4, 12, -1],
            [4, 6, 2, 12, 2],
          ],
          threshold: 0.046539418399334,
          right_val: 0.6627069711685181,
          left_val: -0.1046483963727951,
        },
        {
          features: [
            [11, 13, 3, 2, -1],
            [12, 13, 1, 2, 3],
          ],
          threshold: -0.0017157640540972352,
          right_val: 0.1627524048089981,
          left_val: -0.4961821138858795,
        },
        {
          features: [
            [3, 5, 3, 11, -1],
            [4, 5, 1, 11, 3],
          ],
          threshold: -0.0127788297832012,
          right_val: -0.1602790057659149,
          left_val: 0.4625453948974609,
        },
        {
          features: [
            [3, 6, 13, 12, -1],
            [3, 12, 13, 6, 2],
          ],
          threshold: -0.1521482020616531,
          right_val: 0.1002250984311104,
          left_val: -0.7059270143508911,
        },
        {
          features: [
            [7, 7, 6, 6, -1],
            [7, 7, 3, 3, 2],
            [10, 10, 3, 3, 2],
          ],
          threshold: 0.0031789899803698063,
          right_val: -0.3909341990947723,
          left_val: 0.1234574988484383,
        },
        {
          features: [
            [4, 7, 3, 2, -1],
            [5, 7, 1, 2, 3],
          ],
          threshold: -0.0022882770281285048,
          right_val: -0.1621042042970657,
          left_val: 0.3708150088787079,
        },
        {
          features: [
            [5, 4, 14, 3, -1],
            [12, 4, 7, 3, 2],
          ],
          threshold: -0.0029806189704686403,
          right_val: -0.3323985934257507,
          left_val: 0.1808705925941467,
        },
        {
          features: [
            [10, 12, 3, 2, -1],
            [11, 12, 1, 2, 3],
          ],
          threshold: -0.0015072739915922284,
          right_val: 0.098288856446743,
          left_val: -0.4947231113910675,
        },
        {
          features: [
            [5, 10, 2, 3, -1],
            [5, 11, 2, 1, 3],
          ],
          threshold: 0.0019225040450692177,
          right_val: 0.3077332973480225,
          left_val: -0.177911102771759,
        },
        {
          features: [
            [12, 14, 1, 3, -1],
            [12, 15, 1, 1, 3],
          ],
          threshold: 0.0019025449873879552,
          right_val: -0.5902097225189209,
          left_val: 0.0847949981689453,
        },
        {
          features: [
            [3, 6, 3, 3, -1],
            [4, 6, 1, 3, 3],
          ],
          threshold: -0.003542155958712101,
          right_val: -0.1439293026924133,
          left_val: 0.3117577135562897,
        },
        {
          features: [
            [8, 4, 3, 2, -1],
            [9, 4, 1, 2, 3],
          ],
          threshold: -0.0029751660767942667,
          right_val: 0.0826398879289627,
          left_val: -0.6364914178848267,
        },
        {
          features: [
            [3, 3, 3, 13, -1],
            [4, 3, 1, 13, 3],
          ],
          threshold: 0.0100032901391387,
          right_val: 0.4238753020763397,
          left_val: -0.1169926002621651,
        },
        {
          features: [
            [15, 4, 2, 3, -1],
            [15, 5, 2, 1, 3],
          ],
          threshold: -0.001919353031553328,
          right_val: 0.1103824004530907,
          left_val: -0.4711583852767944,
        },
        {
          features: [
            [12, 8, 4, 4, -1],
            [12, 10, 4, 2, 2],
          ],
          threshold: 0.025070620700717,
          right_val: -0.8035132884979248,
          left_val: 0.0487759299576283,
        },
      ],
      threshold: -1.9596290588378906,
    },
    {
      simpleClassifiers: [
        {
          features: [
            [8, 7, 8, 9, -1],
            [8, 10, 8, 3, 3],
          ],
          threshold: 0.0142147997394204,
          right_val: 0.3346172869205475,
          left_val: -0.6357787847518921,
        },
        {
          features: [
            [8, 0, 12, 6, -1],
            [8, 0, 6, 3, 2],
            [14, 3, 6, 3, 2],
          ],
          threshold: -0.0125259095802903,
          right_val: -0.4133152961730957,
          left_val: 0.3276613056659699,
        },
        {
          features: [
            [5, 9, 3, 6, -1],
            [5, 12, 3, 3, 2],
          ],
          threshold: -0.000022514370357384905,
          right_val: -0.5428205132484436,
          left_val: 0.2310263067483902,
        },
        {
          features: [
            [11, 12, 2, 4, -1],
            [12, 12, 1, 4, 2],
          ],
          threshold: 0.0018600060138851404,
          right_val: -0.6913194060325623,
          left_val: 0.1793334931135178,
        },
        {
          features: [
            [10, 11, 3, 8, -1],
            [11, 11, 1, 8, 3],
          ],
          threshold: 0.007834479212760925,
          right_val: -0.7812684774398804,
          left_val: 0.0910713002085686,
        },
        {
          features: [
            [5, 5, 5, 6, -1],
            [5, 7, 5, 2, 3],
          ],
          threshold: -0.004232230130583048,
          right_val: -0.429060310125351,
          left_val: 0.206584095954895,
        },
        {
          features: [
            [10, 13, 2, 6, -1],
            [10, 16, 2, 3, 2],
          ],
          threshold: -0.0007586060091853142,
          right_val: -0.420703113079071,
          left_val: 0.2073071002960205,
        },
        {
          features: [
            [10, 15, 3, 4, -1],
            [11, 15, 1, 4, 3],
          ],
          threshold: -0.003562638070434332,
          right_val: 0.1311862021684647,
          left_val: -0.632270872592926,
        },
        {
          features: [
            [7, 3, 3, 3, -1],
            [8, 3, 1, 3, 3],
          ],
          threshold: -0.004996016155928373,
          right_val: 0.0782033279538155,
          left_val: -0.7511237859725952,
        },
        {
          features: [
            [5, 8, 6, 2, -1],
            [8, 8, 3, 2, 2],
          ],
          threshold: 0.007309874054044485,
          right_val: -0.663101077079773,
          left_val: 0.0934286415576935,
        },
        {
          features: [
            [8, 7, 4, 2, -1],
            [10, 7, 2, 2, 2],
          ],
          threshold: 0.00022772040392737836,
          right_val: 0.200082004070282,
          left_val: -0.3414882123470306,
        },
        {
          features: [
            [5, 6, 2, 3, -1],
            [6, 6, 1, 3, 2],
          ],
          threshold: 0.0008312416030094028,
          right_val: 0.2585771083831787,
          left_val: -0.2544816136360169,
        },
        {
          features: [
            [8, 0, 3, 8, -1],
            [9, 0, 1, 8, 3],
          ],
          threshold: -0.007549217902123928,
          right_val: 0.0830044224858284,
          left_val: -0.6613898873329163,
        },
        {
          features: [
            [5, 10, 3, 8, -1],
            [5, 14, 3, 4, 2],
          ],
          threshold: -0.0380399487912655,
          right_val: 0.0592315904796124,
          left_val: -0.8216357231140137,
        },
        {
          features: [
            [12, 3, 3, 2, -1],
            [13, 3, 1, 2, 3],
          ],
          threshold: 0.0028484580107033253,
          right_val: -0.5833374261856079,
          left_val: 0.0897299572825432,
        },
        {
          features: [
            [8, 2, 3, 4, -1],
            [9, 2, 1, 4, 3],
          ],
          threshold: 0.004818169865757227,
          right_val: -0.5761976838111877,
          left_val: 0.0939605608582497,
        },
        {
          features: [
            [14, 10, 1, 8, -1],
            [14, 14, 1, 4, 2],
          ],
          threshold: -0.0111904898658395,
          right_val: 0.0736088976264,
          left_val: -0.6254429817199707,
        },
        {
          features: [
            [6, 12, 2, 3, -1],
            [6, 13, 2, 1, 3],
          ],
          threshold: -0.006453712936490774,
          right_val: -0.1002079024910927,
          left_val: 0.5512338876724243,
        },
        {
          features: [
            [6, 12, 2, 3, -1],
            [6, 13, 2, 1, 3],
          ],
          threshold: 0.003322562901303172,
          right_val: 0.5366494059562683,
          left_val: -0.1079789027571678,
        },
        {
          features: [
            [9, 12, 3, 2, -1],
            [10, 12, 1, 2, 3],
          ],
          threshold: 0.0046705761924386024,
          right_val: -0.6768360137939453,
          left_val: 0.0883211269974709,
        },
        {
          features: [
            [12, 2, 1, 12, -1],
            [12, 6, 1, 4, 3],
          ],
          threshold: -0.0116133103147149,
          right_val: 0.0765566304326057,
          left_val: -0.507118821144104,
        },
        {
          features: [
            [2, 8, 14, 6, -1],
            [2, 8, 7, 3, 2],
            [9, 11, 7, 3, 2],
          ],
          threshold: -0.0375156104564667,
          right_val: 0.0594486109912395,
          left_val: -0.7293627262115479,
        },
        {
          features: [
            [11, 3, 3, 17, -1],
            [12, 3, 1, 17, 3],
          ],
          threshold: 0.023086030036211,
          right_val: -0.7845978140830994,
          left_val: 0.0507189594209194,
        },
        {
          features: [
            [12, 12, 1, 2, -1],
            [12, 13, 1, 1, 2],
          ],
          threshold: -0.000007165198894654168,
          right_val: -0.2571322023868561,
          left_val: 0.1668622046709061,
        },
        {
          features: [
            [13, 1, 2, 1, -1],
            [14, 1, 1, 1, 2],
          ],
          threshold: 0.0007161162793636322,
          right_val: -0.4279364049434662,
          left_val: 0.1063603013753891,
        },
        {
          features: [
            [5, 10, 2, 3, -1],
            [5, 11, 2, 1, 3],
          ],
          threshold: 0.004147646017372608,
          right_val: 0.4199318885803223,
          left_val: -0.120696596801281,
        },
        {
          features: [
            [5, 10, 1, 3, -1],
            [5, 11, 1, 1, 3],
          ],
          threshold: -0.002581509994342923,
          right_val: -0.100458100438118,
          left_val: 0.4871808886528015,
        },
        {
          features: [
            [12, 12, 2, 3, -1],
            [12, 13, 2, 1, 3],
          ],
          threshold: -0.0017147070029750466,
          right_val: 0.1037511005997658,
          left_val: -0.460963100194931,
        },
      ],
      threshold: -1.9849590063095093,
    },
    {
      simpleClassifiers: [
        {
          features: [
            [8, 2, 10, 10, -1],
            [13, 2, 5, 10, 2],
          ],
          threshold: -0.0612027198076248,
          right_val: -0.3940125107765198,
          left_val: 0.3907910883426666,
        },
        {
          features: [
            [11, 13, 3, 1, -1],
            [12, 13, 1, 1, 3],
          ],
          threshold: -0.0014643670292571187,
          right_val: 0.1566022038459778,
          left_val: -0.7369784116744995,
        },
        {
          features: [
            [12, 10, 1, 4, -1],
            [12, 12, 1, 2, 2],
          ],
          threshold: 0.000720804207958281,
          right_val: -0.5801265835762024,
          left_val: 0.2167553007602692,
        },
        {
          features: [
            [8, 7, 2, 6, -1],
            [8, 10, 2, 3, 2],
          ],
          threshold: 0.0006489569204859436,
          right_val: 0.1278524994850159,
          left_val: -0.7230809926986694,
        },
        {
          features: [
            [12, 11, 1, 3, -1],
            [12, 12, 1, 1, 3],
          ],
          threshold: -0.0017158190021291375,
          right_val: 0.1021030992269516,
          left_val: -0.771004319190979,
        },
        {
          features: [
            [9, 12, 3, 3, -1],
            [10, 12, 1, 3, 3],
          ],
          threshold: -0.0022490581031888723,
          right_val: 0.1242726966738701,
          left_val: -0.6062312722206116,
        },
        {
          features: [
            [6, 0, 8, 6, -1],
            [6, 3, 8, 3, 2],
          ],
          threshold: 0.0538419783115387,
          right_val: 0.5335056781768799,
          left_val: -0.1716974973678589,
        },
        {
          features: [
            [0, 0, 8, 19, -1],
            [4, 0, 4, 19, 2],
          ],
          threshold: -0.1328897029161453,
          right_val: -0.1895489990711212,
          left_val: 0.5592436790466309,
        },
        {
          features: [
            [5, 6, 4, 9, -1],
            [5, 9, 4, 3, 3],
          ],
          threshold: 0.0009096538997255266,
          right_val: 0.1692426055669785,
          left_val: -0.471664309501648,
        },
        {
          features: [
            [13, 14, 1, 2, -1],
            [13, 15, 1, 1, 2],
          ],
          threshold: 0.0006079914746806026,
          right_val: -0.5984687805175781,
          left_val: 0.1134722009301186,
        },
        {
          features: [
            [1, 3, 8, 15, -1],
            [5, 3, 4, 15, 2],
          ],
          threshold: 0.1607262939214706,
          right_val: 0.6648719906806946,
          left_val: -0.10295519977808,
        },
        {
          features: [
            [13, 14, 2, 3, -1],
            [13, 15, 2, 1, 3],
          ],
          threshold: -0.0017097239615395665,
          right_val: 0.1339205056428909,
          left_val: -0.472762793302536,
        },
        {
          features: [
            [5, 7, 3, 2, -1],
            [6, 7, 1, 2, 3],
          ],
          threshold: 0.0011734620202332735,
          right_val: 0.2613565027713776,
          left_val: -0.2279558926820755,
        },
        {
          features: [
            [8, 5, 3, 1, -1],
            [9, 5, 1, 1, 3],
          ],
          threshold: -0.0015138329472392797,
          right_val: 0.1102833971381187,
          left_val: -0.5539500117301941,
        },
        {
          features: [
            [9, 5, 3, 1, -1],
            [10, 5, 1, 1, 3],
          ],
          threshold: -0.0021774161141365767,
          right_val: 0.0784866735339165,
          left_val: -0.6222890019416809,
        },
        {
          features: [
            [6, 11, 1, 3, -1],
            [6, 12, 1, 1, 3],
          ],
          threshold: -0.0027727920096367598,
          right_val: -0.1349655985832214,
          left_val: 0.4614112079143524,
        },
        {
          features: [
            [18, 4, 1, 2, -1],
            [18, 5, 1, 1, 2],
          ],
          threshold: 0.0009319902746938169,
          right_val: -0.5163183808326721,
          left_val: 0.1016277000308037,
        },
        {
          features: [
            [6, 11, 2, 3, -1],
            [6, 12, 2, 1, 3],
          ],
          threshold: 0.002974665956571698,
          right_val: 0.4211730062961578,
          left_val: -0.1299920976161957,
        },
        {
          features: [
            [10, 10, 3, 4, -1],
            [11, 10, 1, 4, 3],
          ],
          threshold: -0.005039948038756847,
          right_val: 0.0776241272687912,
          left_val: -0.6370617151260376,
        },
        {
          features: [
            [6, 5, 2, 14, -1],
            [6, 12, 2, 7, 2],
          ],
          threshold: 0.0234148502349854,
          right_val: -0.5983113050460815,
          left_val: 0.072182796895504,
        },
        {
          features: [
            [14, 8, 3, 4, -1],
            [14, 10, 3, 2, 2],
          ],
          threshold: -0.0010927390540018678,
          right_val: 0.1182999014854431,
          left_val: -0.416648805141449,
        },
        {
          features: [
            [4, 5, 3, 6, -1],
            [4, 7, 3, 2, 3],
          ],
          threshold: -0.0016441360348835588,
          right_val: -0.2755101919174194,
          left_val: 0.1858306974172592,
        },
        {
          features: [
            [5, 10, 2, 8, -1],
            [5, 14, 2, 4, 2],
          ],
          threshold: -0.0257362797856331,
          right_val: 0.0639077499508858,
          left_val: -0.7514647841453552,
        },
        {
          features: [
            [9, 1, 3, 2, -1],
            [10, 1, 1, 2, 3],
          ],
          threshold: -0.0028924590442329645,
          right_val: 0.0732977390289307,
          left_val: -0.5678088068962097,
        },
        {
          features: [
            [10, 1, 3, 3, -1],
            [11, 1, 1, 3, 3],
          ],
          threshold: -0.005288923159241676,
          right_val: 0.0686869472265244,
          left_val: -0.6373888850212097,
        },
        {
          features: [
            [9, 12, 8, 8, -1],
            [9, 12, 4, 4, 2],
            [13, 16, 4, 4, 2],
          ],
          threshold: 0.0032964269630610943,
          right_val: 0.1598978042602539,
          left_val: -0.2506295144557953,
        },
        {
          features: [
            [8, 13, 6, 4, -1],
            [10, 13, 2, 4, 3],
          ],
          threshold: 0.0249144397675991,
          right_val: -0.7620877027511597,
          left_val: 0.0552609786391258,
        },
        {
          features: [
            [3, 6, 3, 12, -1],
            [4, 6, 1, 12, 3],
          ],
          threshold: -0.0150885004550219,
          right_val: -0.1200395971536636,
          left_val: 0.3703337907791138,
        },
      ],
      threshold: -1.8260079622268677,
    },
    {
      simpleClassifiers: [
        {
          features: [
            [9, 3, 8, 5, -1],
            [13, 3, 4, 5, 2],
          ],
          threshold: -0.0118571799248457,
          right_val: -0.5170331001281738,
          left_val: 0.294215589761734,
        },
        {
          features: [
            [7, 7, 3, 6, -1],
            [7, 10, 3, 3, 2],
          ],
          threshold: 0.002099198056384921,
          right_val: 0.2064850032329559,
          left_val: -0.6147174835205078,
        },
        {
          features: [
            [5, 10, 10, 4, -1],
            [5, 12, 10, 2, 2],
          ],
          threshold: -0.00015772449842188507,
          right_val: -0.5525804758071899,
          left_val: 0.2287074029445648,
        },
        {
          features: [
            [11, 12, 1, 6, -1],
            [11, 15, 1, 3, 2],
          ],
          threshold: -0.00020669099467340857,
          right_val: -0.5492612719535828,
          left_val: 0.1207000985741615,
        },
        {
          features: [
            [5, 8, 6, 2, -1],
            [8, 8, 3, 2, 2],
          ],
          threshold: 0.002267556032165885,
          right_val: -0.4607430100440979,
          left_val: 0.1535481065511704,
        },
        {
          features: [
            [2, 0, 8, 4, -1],
            [2, 0, 4, 2, 2],
            [6, 2, 4, 2, 2],
          ],
          threshold: 0.0144694996997714,
          right_val: 0.4207141101360321,
          left_val: -0.1897630989551544,
        },
        {
          features: [
            [11, 7, 3, 5, -1],
            [12, 7, 1, 5, 3],
          ],
          threshold: -0.0012127560330554843,
          right_val: 0.0994258671998978,
          left_val: -0.4513986110687256,
        },
        {
          features: [
            [12, 13, 2, 3, -1],
            [12, 14, 2, 1, 3],
          ],
          threshold: 0.002150550950318575,
          right_val: -0.6206424236297607,
          left_val: 0.1020087972283363,
        },
        {
          features: [
            [12, 12, 1, 2, -1],
            [12, 13, 1, 1, 2],
          ],
          threshold: -0.0016638869419693947,
          right_val: 0.0772146806120873,
          left_val: -0.7036749124526978,
        },
        {
          features: [
            [5, 11, 6, 3, -1],
            [8, 11, 3, 3, 2],
          ],
          threshold: 0.0010530210565775633,
          right_val: 0.1761610954999924,
          left_val: -0.3245396018028259,
        },
        {
          features: [
            [2, 6, 3, 9, -1],
            [3, 6, 1, 9, 3],
          ],
          threshold: 0.0118364095687866,
          right_val: 0.4264113008975983,
          left_val: -0.1350782066583633,
        },
        {
          features: [
            [12, 12, 1, 3, -1],
            [12, 13, 1, 1, 3],
          ],
          threshold: 0.0009651287109591067,
          right_val: -0.4854493141174316,
          left_val: 0.0945027694106102,
        },
        {
          features: [
            [5, 8, 4, 2, -1],
            [5, 9, 4, 1, 2],
          ],
          threshold: 0.0007565162959508598,
          right_val: 0.1686761975288391,
          left_val: -0.2995952963829041,
        },
        {
          features: [
            [3, 8, 3, 7, -1],
            [4, 8, 1, 7, 3],
          ],
          threshold: 0.0108391502872109,
          right_val: 0.4691441059112549,
          left_val: -0.1112103015184403,
        },
        {
          features: [
            [1, 3, 6, 15, -1],
            [3, 3, 2, 15, 3],
          ],
          threshold: -0.0514394193887711,
          right_val: -0.1177640035748482,
          left_val: 0.4172692000865936,
        },
        {
          features: [
            [12, 14, 4, 3, -1],
            [12, 15, 4, 1, 3],
          ],
          threshold: 0.00349272508174181,
          right_val: -0.5259935259819031,
          left_val: 0.0925122797489166,
        },
        {
          features: [
            [9, 0, 2, 20, -1],
            [9, 0, 1, 10, 2],
            [10, 10, 1, 10, 2],
          ],
          threshold: -0.013926399871707,
          right_val: 0.0523864589631557,
          left_val: -0.6663349866867065,
        },
        {
          features: [
            [6, 12, 3, 3, -1],
            [6, 13, 3, 1, 3],
          ],
          threshold: 0.004559095948934555,
          right_val: 0.4377475082874298,
          left_val: -0.0933838412165642,
        },
        {
          features: [
            [5, 7, 3, 10, -1],
            [5, 12, 3, 5, 2],
          ],
          threshold: -0.0373186990618706,
          right_val: 0.0726278498768806,
          left_val: -0.595836877822876,
        },
        {
          features: [
            [8, 5, 2, 1, -1],
            [9, 5, 1, 1, 2],
          ],
          threshold: 0.0012496879789978266,
          right_val: -0.4877246022224426,
          left_val: 0.0695372372865677,
        },
        {
          features: [
            [5, 12, 3, 3, -1],
            [5, 13, 3, 1, 3],
          ],
          threshold: -0.003730763914063573,
          right_val: -0.117390900850296,
          left_val: 0.3269925117492676,
        },
        {
          features: [
            [15, 5, 4, 2, -1],
            [15, 6, 4, 1, 2],
          ],
          threshold: 0.002114417962729931,
          right_val: -0.4178802073001862,
          left_val: 0.092889092862606,
        },
        {
          features: [
            [15, 5, 3, 2, -1],
            [15, 6, 3, 1, 2],
          ],
          threshold: -0.000642393424641341,
          right_val: 0.1310780942440033,
          left_val: -0.2933219075202942,
        },
        {
          features: [
            [5, 11, 2, 3, -1],
            [5, 12, 2, 1, 3],
          ],
          threshold: -0.0031379980500787497,
          right_val: -0.1150685027241707,
          left_val: 0.324455201625824,
        },
        {
          features: [
            [6, 5, 4, 12, -1],
            [8, 5, 2, 12, 2],
          ],
          threshold: -0.0391869693994522,
          right_val: 0.0500534810125828,
          left_val: -0.7936044931411743,
        },
        {
          features: [
            [7, 4, 3, 3, -1],
            [8, 4, 1, 3, 3],
          ],
          threshold: 0.004464680794626474,
          right_val: -0.5653573870658875,
          left_val: 0.0547760203480721,
        },
        {
          features: [
            [5, 6, 2, 3, -1],
            [6, 6, 1, 3, 2],
          ],
          threshold: 0.0008645136840641499,
          right_val: 0.1975816041231155,
          left_val: -0.1747120022773743,
        },
        {
          features: [
            [4, 8, 3, 1, -1],
            [5, 8, 1, 1, 3],
          ],
          threshold: 0.002423701109364629,
          right_val: 0.4076026082038879,
          left_val: -0.0952961891889572,
        },
        {
          features: [
            [12, 10, 2, 1, -1],
            [13, 10, 1, 1, 2],
          ],
          threshold: -0.002537749009206891,
          right_val: 0.0699205473065376,
          left_val: -0.6245474219322205,
        },
        {
          features: [
            [10, 13, 5, 2, -1],
            [10, 14, 5, 1, 2],
          ],
          threshold: -0.000007330922016990371,
          right_val: -0.281572699546814,
          left_val: 0.1224924996495247,
        },
        {
          features: [
            [11, 13, 1, 3, -1],
            [11, 14, 1, 1, 3],
          ],
          threshold: -0.0018882560543715954,
          right_val: 0.0658209323883057,
          left_val: -0.6267039775848389,
        },
        {
          features: [
            [7, 2, 3, 6, -1],
            [7, 4, 3, 2, 3],
          ],
          threshold: 0.0006060986197553575,
          right_val: 0.129022404551506,
          left_val: -0.254814088344574,
        },
        {
          features: [
            [5, 11, 2, 3, -1],
            [5, 12, 2, 1, 3],
          ],
          threshold: 0.002321375999599695,
          right_val: 0.3245609104633331,
          left_val: -0.0974301174283028,
        },
        {
          features: [
            [12, 14, 2, 3, -1],
            [12, 15, 2, 1, 3],
          ],
          threshold: -0.001853441004641354,
          right_val: 0.0829688534140587,
          left_val: -0.4406534135341644,
        },
        {
          features: [
            [8, 5, 3, 3, -1],
            [8, 6, 3, 1, 3],
          ],
          threshold: 0.0023999500554054976,
          right_val: 0.2828806042671204,
          left_val: -0.1204126998782158,
        },
        {
          features: [
            [7, 6, 9, 10, -1],
            [7, 11, 9, 5, 2],
          ],
          threshold: -0.0813561975955963,
          right_val: 0.0465683005750179,
          left_val: -0.7397223114967346,
        },
        {
          features: [
            [0, 18, 18, 2, -1],
            [6, 18, 6, 2, 3],
          ],
          threshold: -0.0029865680262446404,
          right_val: -0.1983491033315659,
          left_val: 0.1633462011814117,
        },
        {
          features: [
            [0, 5, 1, 8, -1],
            [0, 9, 1, 4, 2],
          ],
          threshold: 0.0028128880076110363,
          right_val: -0.2939819991588593,
          left_val: 0.1183737963438034,
        },
        {
          features: [
            [1, 3, 8, 10, -1],
            [1, 8, 8, 5, 2],
          ],
          threshold: -0.1006079018115997,
          right_val: 0.0425100214779377,
          left_val: -0.7371764779090881,
        },
        {
          features: [
            [9, 12, 6, 2, -1],
            [9, 13, 6, 1, 2],
          ],
          threshold: 0.00011854549666168168,
          right_val: -0.2913986146450043,
          left_val: 0.1047106012701988,
        },
        {
          features: [
            [9, 6, 2, 3, -1],
            [9, 7, 2, 1, 3],
          ],
          threshold: 0.002237530890852213,
          right_val: 0.3404592871665955,
          left_val: -0.0960420593619347,
        },
        {
          features: [
            [9, 4, 3, 3, -1],
            [10, 4, 1, 3, 3],
          ],
          threshold: -0.004498699214309454,
          right_val: 0.0562368407845497,
          left_val: -0.5823466181755066,
        },
        {
          features: [
            [13, 13, 1, 3, -1],
            [13, 14, 1, 1, 3],
          ],
          threshold: -0.00036484538577497005,
          right_val: 0.1011399030685425,
          left_val: -0.279561311006546,
        },
        {
          features: [
            [2, 6, 13, 3, -1],
            [2, 7, 13, 1, 3],
          ],
          threshold: -0.00799402967095375,
          right_val: -0.1194123029708862,
          left_val: 0.2777594923973084,
        },
        {
          features: [
            [10, 15, 2, 4, -1],
            [11, 15, 1, 4, 2],
          ],
          threshold: -0.005154721904546022,
          right_val: 0.0489171408116817,
          left_val: -0.6022951006889343,
        },
        {
          features: [
            [7, 7, 2, 3, -1],
            [8, 7, 1, 3, 2],
          ],
          threshold: -0.000817726191598922,
          right_val: -0.1640768945217133,
          left_val: 0.1766050010919571,
        },
        {
          features: [
            [3, 6, 12, 8, -1],
            [3, 6, 6, 4, 2],
            [9, 10, 6, 4, 2],
          ],
          threshold: 0.067434698343277,
          right_val: -0.7186576128005981,
          left_val: 0.0407614596188068,
        },
        {
          features: [
            [12, 0, 8, 4, -1],
            [12, 0, 4, 2, 2],
            [16, 2, 4, 2, 2],
          ],
          threshold: -0.002410328947007656,
          right_val: -0.1608185023069382,
          left_val: 0.1767168045043945,
        },
        {
          features: [
            [9, 15, 3, 3, -1],
            [10, 15, 1, 3, 3],
          ],
          threshold: -0.0035183799918740988,
          right_val: 0.0706716328859329,
          left_val: -0.4307860136032105,
        },
        {
          features: [
            [10, 14, 1, 2, -1],
            [10, 15, 1, 1, 2],
          ],
          threshold: -0.000014561560419679154,
          right_val: -0.2338785976171494,
          left_val: 0.1271470040082932,
        },
        {
          features: [
            [6, 11, 5, 6, -1],
            [6, 14, 5, 3, 2],
          ],
          threshold: -0.0479518212378025,
          right_val: 0.0368030816316605,
          left_val: -0.7908576726913452,
        },
        {
          features: [
            [5, 10, 2, 3, -1],
            [5, 11, 2, 1, 3],
          ],
          threshold: 0.0021735159680247307,
          right_val: 0.2533034980297089,
          left_val: -0.1308927983045578,
        },
        {
          features: [
            [5, 10, 1, 3, -1],
            [5, 11, 1, 1, 3],
          ],
          threshold: -0.00345422700047493,
          right_val: -0.075337253510952,
          left_val: 0.5102524757385254,
        },
      ],
      threshold: -1.944674015045166,
    },
    {
      simpleClassifiers: [
        {
          features: [
            [5, 6, 3, 4, -1],
            [6, 6, 1, 4, 3],
          ],
          threshold: 0.004524316173046827,
          right_val: 0.5190864205360413,
          left_val: -0.3048551976680756,
        },
        {
          features: [
            [9, 6, 6, 4, -1],
            [11, 6, 2, 4, 3],
          ],
          threshold: 0.002337235026061535,
          right_val: 0.2905215919017792,
          left_val: -0.4290454089641571,
        },
        {
          features: [
            [6, 5, 12, 6, -1],
            [6, 7, 12, 2, 3],
          ],
          threshold: -0.004424323793500662,
          right_val: -0.4595498144626617,
          left_val: 0.2106857001781464,
        },
        {
          features: [
            [3, 1, 16, 7, -1],
            [11, 1, 8, 7, 2],
          ],
          threshold: -0.0128874396905303,
          right_val: -0.4587906897068024,
          left_val: 0.1913823038339615,
        },
        {
          features: [
            [12, 11, 1, 6, -1],
            [12, 14, 1, 3, 2],
          ],
          threshold: -0.00005237092045717873,
          right_val: -0.5026736855506897,
          left_val: 0.1414148956537247,
        },
        {
          features: [
            [6, 6, 9, 8, -1],
            [6, 10, 9, 4, 2],
          ],
          threshold: -0.004773849155753851,
          right_val: 0.1234100982546806,
          left_val: -0.4876083135604858,
        },
        {
          features: [
            [5, 9, 4, 6, -1],
            [5, 12, 4, 3, 2],
          ],
          threshold: 0.0009631586144678295,
          right_val: -0.4479374885559082,
          left_val: 0.1336739957332611,
        },
        {
          features: [
            [1, 0, 6, 14, -1],
            [4, 0, 3, 14, 2],
          ],
          threshold: -0.0891403034329414,
          right_val: -0.1592300981283188,
          left_val: 0.5038766860961914,
        },
        {
          features: [
            [8, 1, 1, 9, -1],
            [8, 4, 1, 3, 3],
          ],
          threshold: 0.0017201449954882264,
          right_val: 0.2434068024158478,
          left_val: -0.2053536027669907,
        },
        {
          features: [
            [11, 13, 2, 2, -1],
            [11, 14, 2, 1, 2],
          ],
          threshold: -0.0026712119579315186,
          right_val: 0.0530356504023075,
          left_val: -0.6331971287727356,
        },
        {
          features: [
            [2, 7, 4, 13, -1],
            [4, 7, 2, 13, 2],
          ],
          threshold: 0.0373532809317112,
          right_val: 0.4664533138275147,
          left_val: -0.1136024966835976,
        },
        {
          features: [
            [5, 8, 6, 6, -1],
            [8, 8, 3, 6, 2],
          ],
          threshold: -0.0315109603106976,
          right_val: 0.0693718567490578,
          left_val: -0.688204824924469,
        },
        {
          features: [
            [18, 0, 2, 20, -1],
            [19, 0, 1, 20, 2],
          ],
          threshold: 0.0152938198298216,
          right_val: 0.4626778960227966,
          left_val: -0.1004384011030197,
        },
        {
          features: [
            [6, 7, 3, 3, -1],
            [7, 7, 1, 3, 3],
          ],
          threshold: 0.005496690981090069,
          right_val: 0.4512706100940704,
          left_val: -0.0935146436095238,
        },
        {
          features: [
            [13, 10, 1, 4, -1],
            [13, 12, 1, 2, 2],
          ],
          threshold: -0.004631143994629383,
          right_val: 0.0850035473704338,
          left_val: -0.6431459784507751,
        },
        {
          features: [
            [12, 11, 2, 2, -1],
            [12, 12, 2, 1, 2],
          ],
          threshold: 0.000809433578979224,
          right_val: -0.4932079911231995,
          left_val: 0.0797389671206474,
        },
        {
          features: [
            [3, 6, 12, 6, -1],
            [3, 6, 6, 3, 2],
            [9, 9, 6, 3, 2],
          ],
          threshold: 0.0297459401190281,
          right_val: -0.5048243999481201,
          left_val: 0.0784204676747322,
        },
        {
          features: [
            [10, 13, 2, 2, -1],
            [10, 14, 2, 1, 2],
          ],
          threshold: 0.0009707012213766575,
          right_val: -0.570351779460907,
          left_val: 0.0581354387104511,
        },
        {
          features: [
            [6, 13, 2, 3, -1],
            [6, 14, 2, 1, 3],
          ],
          threshold: 0.002453465946018696,
          right_val: 0.3685297071933746,
          left_val: -0.112590603530407,
        },
        {
          features: [
            [13, 5, 1, 3, -1],
            [13, 6, 1, 1, 3],
          ],
          threshold: 0.001970981014892459,
          right_val: -0.5268386006355286,
          left_val: 0.0771853104233742,
        },
        {
          features: [
            [6, 14, 3, 3, -1],
            [6, 15, 3, 1, 3],
          ],
          threshold: 0.00486430199816823,
          right_val: 0.4147444069385529,
          left_val: -0.1047953963279724,
        },
        {
          features: [
            [5, 15, 3, 3, -1],
            [5, 16, 3, 1, 3],
          ],
          threshold: 0.001014326000586152,
          right_val: 0.286710798740387,
          left_val: -0.1473156064748764,
        },
        {
          features: [
            [15, 3, 1, 3, -1],
            [15, 4, 1, 1, 3],
          ],
          threshold: -0.0009509908850304782,
          right_val: 0.0881083533167839,
          left_val: -0.3807004988193512,
        },
        {
          features: [
            [3, 8, 3, 12, -1],
            [4, 8, 1, 12, 3],
          ],
          threshold: -0.0056730289943516254,
          right_val: -0.1369633972644806,
          left_val: 0.2481890022754669,
        },
        {
          features: [
            [3, 4, 3, 14, -1],
            [4, 4, 1, 14, 3],
          ],
          threshold: 0.0169878993183374,
          right_val: 0.5278167128562927,
          left_val: -0.0808960422873497,
        },
        {
          features: [
            [6, 11, 6, 2, -1],
            [9, 11, 3, 2, 2],
          ],
          threshold: -0.007527878973633051,
          right_val: 0.0893896669149399,
          left_val: -0.4688000977039337,
        },
        {
          features: [
            [4, 8, 8, 4, -1],
            [8, 8, 4, 4, 2],
          ],
          threshold: 0.0339485295116901,
          right_val: -0.6739956140518188,
          left_val: 0.0505947917699814,
        },
        {
          features: [
            [4, 5, 2, 4, -1],
            [5, 5, 1, 4, 2],
          ],
          threshold: 0.0008332884171977639,
          right_val: 0.1960709989070892,
          left_val: -0.189313605427742,
        },
        {
          features: [
            [7, 3, 2, 1, -1],
            [8, 3, 1, 1, 2],
          ],
          threshold: -0.0005963249132037163,
          right_val: 0.1054477021098137,
          left_val: -0.3622928857803345,
        },
        {
          features: [
            [12, 16, 2, 3, -1],
            [12, 17, 2, 1, 3],
          ],
          threshold: 0.003090572077780962,
          right_val: -0.5531697273254395,
          left_val: 0.0572096295654774,
        },
        {
          features: [
            [3, 16, 6, 3, -1],
            [3, 17, 6, 1, 3],
          ],
          threshold: 0.003515261923894286,
          right_val: 0.2936989963054657,
          left_val: -0.1221107020974159,
        },
        {
          features: [
            [13, 4, 2, 1, -1],
            [14, 4, 1, 1, 2],
          ],
          threshold: 0.000793337298091501,
          right_val: -0.445398211479187,
          left_val: 0.0759779065847397,
        },
        {
          features: [
            [9, 16, 4, 4, -1],
            [11, 16, 2, 4, 2],
          ],
          threshold: -0.0111893601715565,
          right_val: 0.0574383698403835,
          left_val: -0.5059651732444763,
        },
        {
          features: [
            [5, 9, 3, 1, -1],
            [6, 9, 1, 1, 3],
          ],
          threshold: -0.001178779057227075,
          right_val: -0.1076223030686379,
          left_val: 0.3079969882965088,
        },
        {
          features: [
            [6, 8, 2, 2, -1],
            [6, 9, 2, 1, 2],
          ],
          threshold: 0.00005441885150503367,
          right_val: 0.131384402513504,
          left_val: -0.2599756121635437,
        },
        {
          features: [
            [12, 13, 2, 1, -1],
            [13, 13, 1, 1, 2],
          ],
          threshold: -0.00000725623021935462,
          right_val: -0.2109470069408417,
          left_val: 0.1543983966112137,
        },
        {
          features: [
            [6, 7, 6, 3, -1],
            [8, 7, 2, 3, 3],
          ],
          threshold: -0.000834362581372261,
          right_val: -0.2436766028404236,
          left_val: 0.1368986964225769,
        },
        {
          features: [
            [5, 8, 2, 10, -1],
            [5, 13, 2, 5, 2],
          ],
          threshold: -0.0333806090056896,
          right_val: 0.0509867407381535,
          left_val: -0.6747735738754272,
        },
        {
          features: [
            [0, 8, 1, 2, -1],
            [0, 9, 1, 1, 2],
          ],
          threshold: 0.0007409349782392383,
          right_val: -0.3522076010704041,
          left_val: 0.0912485271692276,
        },
        {
          features: [
            [2, 11, 4, 4, -1],
            [4, 11, 2, 4, 2],
          ],
          threshold: -0.0020966369193047285,
          right_val: -0.1638002991676331,
          left_val: 0.1911004930734634,
        },
        {
          features: [
            [1, 9, 12, 3, -1],
            [5, 9, 4, 3, 3],
          ],
          threshold: -0.0693395063281059,
          right_val: 0.0357266291975975,
          left_val: -0.8770086765289307,
        },
        {
          features: [
            [8, 15, 2, 3, -1],
            [9, 15, 1, 3, 2],
          ],
          threshold: -0.005708999000489712,
          right_val: 0.0355459600687027,
          left_val: -0.680672287940979,
        },
        {
          features: [
            [8, 6, 3, 3, -1],
            [8, 7, 3, 1, 3],
          ],
          threshold: 0.006866876035928726,
          right_val: 0.5226590037345886,
          left_val: -0.0648868680000305,
        },
        {
          features: [
            [1, 2, 1, 2, -1],
            [1, 3, 1, 1, 2],
          ],
          threshold: 0.0005460283136926591,
          right_val: -0.3028525114059448,
          left_val: 0.1092441976070404,
        },
        {
          features: [
            [5, 1, 7, 6, -1],
            [5, 3, 7, 2, 3],
          ],
          threshold: 0.00643490394577384,
          right_val: 0.190221294760704,
          left_val: -0.165619507431984,
        },
        {
          features: [
            [5, 10, 2, 3, -1],
            [5, 11, 2, 1, 3],
          ],
          threshold: -0.0101124197244644,
          right_val: -0.0383473299443722,
          left_val: 0.7452300190925598,
        },
        {
          features: [
            [13, 7, 3, 4, -1],
            [13, 9, 3, 2, 2],
          ],
          threshold: -0.0007515287725254893,
          right_val: 0.1132168993353844,
          left_val: -0.2814728021621704,
        },
        {
          features: [
            [5, 10, 3, 3, -1],
            [5, 11, 3, 1, 3],
          ],
          threshold: 0.0028225290589034557,
          right_val: 0.2560853064060211,
          left_val: -0.1236440017819405,
        },
        {
          features: [
            [7, 5, 3, 1, -1],
            [8, 5, 1, 1, 3],
          ],
          threshold: 0.002205879893153906,
          right_val: -0.5615208148956299,
          left_val: 0.0573342815041542,
        },
        {
          features: [
            [0, 0, 11, 16, -1],
            [0, 8, 11, 8, 2],
          ],
          threshold: 0.281641811132431,
          right_val: -0.6492379903793335,
          left_val: 0.0420923791825771,
        },
        {
          features: [
            [7, 4, 3, 2, -1],
            [8, 4, 1, 2, 3],
          ],
          threshold: -0.004259314853698015,
          right_val: 0.0435026586055756,
          left_val: -0.6485499739646912,
        },
        {
          features: [
            [6, 12, 2, 3, -1],
            [6, 13, 2, 1, 3],
          ],
          threshold: 0.0026586679741740227,
          right_val: 0.3415873050689697,
          left_val: -0.0935261398553848,
        },
        {
          features: [
            [6, 11, 2, 3, -1],
            [6, 12, 2, 1, 3],
          ],
          threshold: 0.002097198972478509,
          right_val: 0.3176026940345764,
          left_val: -0.1106892973184586,
        },
        {
          features: [
            [13, 5, 2, 2, -1],
            [13, 6, 2, 1, 2],
          ],
          threshold: -0.0010267860488966107,
          right_val: 0.0989731103181839,
          left_val: -0.3761210143566132,
        },
      ],
      threshold: -1.838927984237671,
    },
    {
      simpleClassifiers: [
        {
          features: [
            [8, 8, 2, 6, -1],
            [8, 10, 2, 2, 3],
          ],
          threshold: 0.0026354179717600346,
          right_val: 0.2771103084087372,
          left_val: -0.5249680876731873,
        },
        {
          features: [
            [5, 6, 3, 4, -1],
            [6, 6, 1, 4, 3],
          ],
          threshold: 0.002627965062856674,
          right_val: 0.3701362907886505,
          left_val: -0.3219544887542725,
        },
        {
          features: [
            [10, 0, 10, 8, -1],
            [10, 0, 5, 4, 2],
            [15, 4, 5, 4, 2],
          ],
          threshold: -0.005888910964131355,
          right_val: -0.4180032908916473,
          left_val: 0.2377752959728241,
        },
        {
          features: [
            [9, 7, 2, 12, -1],
            [9, 11, 2, 4, 3],
          ],
          threshold: 0.0019291159696877003,
          right_val: 0.1369217038154602,
          left_val: -0.4712206125259399,
        },
        {
          features: [
            [6, 3, 12, 12, -1],
            [6, 3, 6, 6, 2],
            [12, 9, 6, 6, 2],
          ],
          threshold: -0.015205480158329,
          right_val: 0.1740240007638931,
          left_val: -0.3961842954158783,
        },
        {
          features: [
            [5, 7, 4, 6, -1],
            [5, 9, 4, 2, 3],
          ],
          threshold: 0.002339357975870371,
          right_val: 0.1565911024808884,
          left_val: -0.3850890100002289,
        },
        {
          features: [
            [5, 7, 10, 10, -1],
            [5, 7, 5, 5, 2],
            [10, 12, 5, 5, 2],
          ],
          threshold: 0.0423956215381622,
          right_val: -0.6216400265693665,
          left_val: 0.1047870963811874,
        },
        {
          features: [
            [2, 1, 4, 15, -1],
            [4, 1, 2, 15, 2],
          ],
          threshold: -0.0569596402347088,
          right_val: -0.1268478035926819,
          left_val: 0.5122585892677307,
        },
        {
          features: [
            [12, 11, 2, 2, -1],
            [13, 11, 1, 2, 2],
          ],
          threshold: -0.000007284556886588689,
          right_val: -0.311856210231781,
          left_val: 0.1513689011335373,
        },
        {
          features: [
            [6, 11, 10, 6, -1],
            [6, 14, 10, 3, 2],
          ],
          threshold: -0.0796337500214577,
          right_val: 0.044978428632021,
          left_val: -0.8432474732398987,
        },
        {
          features: [
            [5, 12, 4, 3, -1],
            [5, 13, 4, 1, 3],
          ],
          threshold: 0.005916868802160025,
          right_val: 0.4743410050868988,
          left_val: -0.1074597984552383,
        },
        {
          features: [
            [6, 12, 1, 3, -1],
            [6, 13, 1, 1, 3],
          ],
          threshold: -0.0014736950397491455,
          right_val: -0.1476064026355743,
          left_val: 0.3606745004653931,
        },
        {
          features: [
            [3, 7, 12, 8, -1],
            [3, 7, 6, 4, 2],
            [9, 11, 6, 4, 2],
          ],
          threshold: -0.0396309718489647,
          right_val: 0.0748667865991592,
          left_val: -0.6583898067474365,
        },
        {
          features: [
            [6, 2, 2, 6, -1],
            [6, 4, 2, 2, 3],
          ],
          threshold: 0.00062401412287727,
          right_val: 0.1565213948488236,
          left_val: -0.261956512928009,
        },
        {
          features: [
            [11, 11, 5, 4, -1],
            [11, 13, 5, 2, 2],
          ],
          threshold: -0.000023399210476782173,
          right_val: -0.3032081127166748,
          left_val: 0.1215751022100449,
        },
        {
          features: [
            [5, 8, 6, 6, -1],
            [8, 8, 3, 6, 2],
          ],
          threshold: 0.0308020301163197,
          right_val: -0.6660987734794617,
          left_val: 0.0444087311625481,
        },
        {
          features: [
            [5, 12, 4, 2, -1],
            [7, 12, 2, 2, 2],
          ],
          threshold: 0.00014787449617870152,
          right_val: 0.1472305059432983,
          left_val: -0.2444950938224793,
        },
        {
          features: [
            [3, 13, 3, 7, -1],
            [4, 13, 1, 7, 3],
          ],
          threshold: 0.004863056819885969,
          right_val: 0.3259679973125458,
          left_val: -0.1126781031489372,
        },
        {
          features: [
            [11, 7, 5, 9, -1],
            [11, 10, 5, 3, 3],
          ],
          threshold: 0.0621918812394142,
          right_val: -0.6403107047080994,
          left_val: 0.057439960539341,
        },
        {
          features: [
            [4, 3, 15, 9, -1],
            [4, 6, 15, 3, 3],
          ],
          threshold: 0.0014668420189991593,
          right_val: -0.337278813123703,
          left_val: 0.0953566431999207,
        },
        {
          features: [
            [15, 13, 2, 2, -1],
            [15, 13, 1, 1, 2],
            [16, 14, 1, 1, 2],
          ],
          threshold: -0.000014742349776497576,
          right_val: -0.1708389967679977,
          left_val: 0.1975961029529572,
        },
        {
          features: [
            [6, 5, 6, 13, -1],
            [9, 5, 3, 13, 2],
          ],
          threshold: -0.0324956700205803,
          right_val: 0.0903633311390877,
          left_val: -0.3684872984886169,
        },
        {
          features: [
            [5, 9, 3, 1, -1],
            [6, 9, 1, 1, 3],
          ],
          threshold: -0.0015333830378949642,
          right_val: -0.1041681990027428,
          left_val: 0.3225637972354889,
        },
        {
          features: [
            [6, 1, 2, 15, -1],
            [6, 6, 2, 5, 3],
          ],
          threshold: -0.0279989093542099,
          right_val: 0.082653783261776,
          left_val: -0.4909791052341461,
        },
        {
          features: [
            [11, 0, 4, 3, -1],
            [13, 0, 2, 3, 2],
          ],
          threshold: 0.004978389013558626,
          right_val: -0.4405778050422669,
          left_val: 0.0732380300760269,
        },
        {
          features: [
            [0, 0, 2, 4, -1],
            [0, 2, 2, 2, 2],
          ],
          threshold: 0.006822602823376656,
          right_val: -0.4146091043949127,
          left_val: 0.0767660290002823,
        },
        {
          features: [
            [4, 8, 9, 3, -1],
            [4, 9, 9, 1, 3],
          ],
          threshold: 0.0114978803321719,
          right_val: 0.4009974896907806,
          left_val: -0.0914401113986969,
        },
        {
          features: [
            [6, 5, 6, 2, -1],
            [8, 5, 2, 2, 3],
          ],
          threshold: -0.0110030695796013,
          right_val: 0.0727767273783684,
          left_val: -0.5741754174232483,
        },
        {
          features: [
            [4, 15, 2, 2, -1],
            [4, 15, 1, 1, 2],
            [5, 16, 1, 1, 2],
          ],
          threshold: 0.0004934588796459138,
          right_val: 0.2457520961761475,
          left_val: -0.1335359066724777,
        },
        {
          features: [
            [6, 14, 2, 3, -1],
            [6, 15, 2, 1, 3],
          ],
          threshold: 0.0022130589932203293,
          right_val: 0.3163211941719055,
          left_val: -0.1075384020805359,
        },
        {
          features: [
            [6, 12, 1, 6, -1],
            [6, 15, 1, 3, 2],
          ],
          threshold: 0.0051011620089411736,
          right_val: -0.4294820129871368,
          left_val: 0.0789853185415268,
        },
        {
          features: [
            [5, 9, 2, 10, -1],
            [5, 14, 2, 5, 2],
          ],
          threshold: -0.0373056381940842,
          right_val: 0.0450499393045902,
          left_val: -0.6792119145393372,
        },
        {
          features: [
            [3, 6, 3, 10, -1],
            [4, 6, 1, 10, 3],
          ],
          threshold: -0.006127169821411371,
          right_val: -0.1455928981304169,
          left_val: 0.2306205928325653,
        },
        {
          features: [
            [3, 7, 3, 5, -1],
            [4, 7, 1, 5, 3],
          ],
          threshold: 0.007651770021766424,
          right_val: 0.4307296872138977,
          left_val: -0.090355172753334,
        },
        {
          features: [
            [11, 0, 6, 2, -1],
            [13, 0, 2, 2, 3],
          ],
          threshold: -0.011280870065093,
          right_val: 0.0746744498610497,
          left_val: -0.4785071909427643,
        },
        {
          features: [
            [11, 12, 2, 1, -1],
            [12, 12, 1, 1, 2],
          ],
          threshold: -0.000014724049833603203,
          right_val: -0.22535640001297,
          left_val: 0.1445989012718201,
        },
        {
          features: [
            [11, 12, 2, 1, -1],
            [12, 12, 1, 1, 2],
          ],
          threshold: -0.0019895960576832294,
          right_val: 0.0549059212207794,
          left_val: -0.6152756810188293,
        },
        {
          features: [
            [6, 16, 1, 3, -1],
            [6, 17, 1, 1, 3],
          ],
          threshold: 0.0016876959707587957,
          right_val: 0.3300470113754273,
          left_val: -0.0976197868585587,
        },
        {
          features: [
            [10, 16, 5, 3, -1],
            [10, 17, 5, 1, 3],
          ],
          threshold: 0.00983907375484705,
          right_val: -0.755151093006134,
          left_val: 0.0409724116325378,
        },
        {
          features: [
            [7, 13, 1, 3, -1],
            [7, 14, 1, 1, 3],
          ],
          threshold: 0.0013243829598650336,
          right_val: 0.3066510856151581,
          left_val: -0.1004628017544746,
        },
        {
          features: [
            [12, 4, 8, 2, -1],
            [12, 5, 8, 1, 2],
          ],
          threshold: 0.0031150300055742264,
          right_val: -0.3352459967136383,
          left_val: 0.089804470539093,
        },
        {
          features: [
            [8, 7, 4, 3, -1],
            [10, 7, 2, 3, 2],
          ],
          threshold: 0.000007390742212010082,
          right_val: 0.1328824013471603,
          left_val: -0.2241040021181107,
        },
        {
          features: [
            [12, 10, 5, 9, -1],
            [12, 13, 5, 3, 3],
          ],
          threshold: 0.0325595699250698,
          right_val: -0.5424032807350159,
          left_val: 0.0501133985817432,
        },
        {
          features: [
            [5, 11, 2, 3, -1],
            [5, 12, 2, 1, 3],
          ],
          threshold: -0.0029865119140595198,
          right_val: -0.1116421967744827,
          left_val: 0.2838534116744995,
        },
        {
          features: [
            [5, 11, 3, 3, -1],
            [5, 12, 3, 1, 3],
          ],
          threshold: 0.0016058710170909762,
          right_val: 0.290326714515686,
          left_val: -0.1202408000826836,
        },
        {
          features: [
            [11, 0, 2, 4, -1],
            [12, 0, 1, 4, 2],
          ],
          threshold: 0.0022018649615347385,
          right_val: -0.438460499048233,
          left_val: 0.0781101286411285,
        },
        {
          features: [
            [5, 9, 10, 6, -1],
            [5, 9, 5, 3, 2],
            [10, 12, 5, 3, 2],
          ],
          threshold: -0.0057107508182525635,
          right_val: 0.0929412990808487,
          left_val: -0.326088011264801,
        },
        {
          features: [
            [6, 12, 3, 3, -1],
            [6, 13, 3, 1, 3],
          ],
          threshold: 0.0008950303890742362,
          right_val: 0.2233189940452576,
          left_val: -0.1350415945053101,
        },
        {
          features: [
            [1, 3, 6, 12, -1],
            [1, 9, 6, 6, 2],
          ],
          threshold: 0.077259249985218,
          right_val: -0.4171401858329773,
          left_val: 0.0732213407754898,
        },
        {
          features: [
            [1, 5, 5, 10, -1],
            [1, 10, 5, 5, 2],
          ],
          threshold: -0.0101456101983786,
          right_val: 0.1409918963909149,
          left_val: -0.2733097076416016,
        },
        {
          features: [
            [10, 14, 1, 2, -1],
            [10, 15, 1, 1, 2],
          ],
          threshold: -0.00000708787183612003,
          right_val: -0.2325371950864792,
          left_val: 0.1260295957326889,
        },
        {
          features: [
            [9, 5, 2, 8, -1],
            [9, 5, 1, 4, 2],
            [10, 9, 1, 4, 2],
          ],
          threshold: -0.008023200556635857,
          right_val: 0.0441995784640312,
          left_val: -0.6268284916877747,
        },
        {
          features: [
            [17, 12, 3, 1, -1],
            [18, 12, 1, 1, 3],
          ],
          threshold: -0.0015409339684993029,
          right_val: -0.0958197265863419,
          left_val: 0.3215487897396088,
        },
        {
          features: [
            [5, 16, 2, 3, -1],
            [5, 17, 2, 1, 3],
          ],
          threshold: -0.001381556037813425,
          right_val: -0.1084505990147591,
          left_val: 0.2390906065702438,
        },
        {
          features: [
            [11, 18, 7, 2, -1],
            [11, 19, 7, 1, 2],
          ],
          threshold: -0.008555952459573746,
          right_val: 0.0469044595956802,
          left_val: -0.628809928894043,
        },
        {
          features: [
            [12, 6, 3, 8, -1],
            [13, 6, 1, 8, 3],
          ],
          threshold: 0.000014967939932830632,
          right_val: 0.1626560986042023,
          left_val: -0.1733105033636093,
        },
      ],
      threshold: -1.8807189464569092,
    },
    {
      simpleClassifiers: [
        {
          features: [
            [11, 6, 6, 5, -1],
            [14, 6, 3, 5, 2],
          ],
          threshold: -0.00929113756865263,
          right_val: -0.4868162870407105,
          left_val: 0.2667650878429413,
        },
        {
          features: [
            [9, 7, 4, 6, -1],
            [9, 7, 2, 3, 2],
            [11, 10, 2, 3, 2],
          ],
          threshold: -0.0010201609693467617,
          right_val: -0.42971470952034,
          left_val: 0.214691698551178,
        },
        {
          features: [
            [10, 8, 6, 6, -1],
            [10, 10, 6, 2, 3],
          ],
          threshold: 0.0018099240260198712,
          right_val: 0.172931507229805,
          left_val: -0.4708526134490967,
        },
        {
          features: [
            [2, 1, 4, 17, -1],
            [4, 1, 2, 17, 2],
          ],
          threshold: -0.0631954520940781,
          right_val: -0.1192208006978035,
          left_val: 0.5586851239204407,
        },
        {
          features: [
            [7, 1, 9, 4, -1],
            [7, 3, 9, 2, 2],
          ],
          threshold: 0.0015157799934968352,
          right_val: 0.1425653994083405,
          left_val: -0.3308742940425873,
        },
        {
          features: [
            [7, 6, 3, 4, -1],
            [8, 6, 1, 4, 3],
          ],
          threshold: -0.003113426035270095,
          right_val: -0.1556340008974075,
          left_val: 0.3189736008644104,
        },
        {
          features: [
            [5, 9, 8, 2, -1],
            [9, 9, 4, 2, 2],
          ],
          threshold: 0.00671872403472662,
          right_val: -0.4614211022853851,
          left_val: 0.1130800992250443,
        },
        {
          features: [
            [11, 12, 1, 4, -1],
            [11, 14, 1, 2, 2],
          ],
          threshold: -0.000014929190001566894,
          right_val: -0.3826808929443359,
          left_val: 0.1130312010645866,
        },
        {
          features: [
            [13, 11, 1, 3, -1],
            [13, 12, 1, 1, 3],
          ],
          threshold: -0.0019974811002612114,
          right_val: 0.0555626712739468,
          left_val: -0.6783381104469299,
        },
        {
          features: [
            [10, 19, 4, 1, -1],
            [12, 19, 2, 1, 2],
          ],
          threshold: 0.0000443618991994299,
          right_val: 0.1752458959817886,
          left_val: -0.2147872000932694,
        },
        {
          features: [
            [5, 4, 10, 12, -1],
            [5, 4, 5, 6, 2],
            [10, 10, 5, 6, 2],
          ],
          threshold: -0.009437933564186096,
          right_val: 0.1049441024661064,
          left_val: -0.2900882065296173,
        },
        {
          features: [
            [4, 6, 5, 6, -1],
            [4, 9, 5, 3, 2],
          ],
          threshold: 0.00010263459989801049,
          right_val: 0.115801103413105,
          left_val: -0.3680945038795471,
        },
        {
          features: [
            [5, 10, 4, 8, -1],
            [5, 14, 4, 4, 2],
          ],
          threshold: -0.0435120798647404,
          right_val: 0.0451606288552284,
          left_val: -0.5796747803688049,
        },
        {
          features: [
            [7, 5, 3, 3, -1],
            [7, 6, 3, 1, 3],
          ],
          threshold: 0.0023894330952316523,
          right_val: 0.2572689950466156,
          left_val: -0.1244383007287979,
        },
        {
          features: [
            [7, 4, 2, 2, -1],
            [8, 4, 1, 2, 2],
          ],
          threshold: 0.0036203579511493444,
          right_val: -0.6445654034614563,
          left_val: 0.0483852699398994,
        },
        {
          features: [
            [0, 0, 2, 1, -1],
            [1, 0, 1, 1, 2],
          ],
          threshold: -0.0004208663885947317,
          right_val: 0.0975081324577332,
          left_val: -0.2996363937854767,
        },
        {
          features: [
            [0, 3, 6, 16, -1],
            [2, 3, 2, 16, 3],
          ],
          threshold: -0.0363201610743999,
          right_val: -0.1037318035960197,
          left_val: 0.324990302324295,
        },
        {
          features: [
            [2, 6, 3, 12, -1],
            [3, 6, 1, 12, 3],
          ],
          threshold: 0.005567824002355337,
          right_val: 0.2772139012813568,
          left_val: -0.1286551952362061,
        },
        {
          features: [
            [12, 11, 2, 2, -1],
            [12, 12, 2, 1, 2],
          ],
          threshold: 0.0014324679505079985,
          right_val: -0.5041165947914124,
          left_val: 0.0630446672439575,
        },
        {
          features: [
            [18, 0, 2, 13, -1],
            [19, 0, 1, 13, 2],
          ],
          threshold: 0.0012268769787624478,
          right_val: 0.1794432997703552,
          left_val: -0.1707358956336975,
        },
        {
          features: [
            [9, 14, 5, 4, -1],
            [9, 16, 5, 2, 2],
          ],
          threshold: 0.00401255302131176,
          right_val: -0.4132161140441895,
          left_val: 0.0721001327037811,
        },
        {
          features: [
            [5, 10, 2, 3, -1],
            [5, 11, 2, 1, 3],
          ],
          threshold: 0.004737759009003639,
          right_val: 0.3430379927158356,
          left_val: -0.0901008769869804,
        },
        {
          features: [
            [10, 14, 4, 3, -1],
            [10, 15, 4, 1, 3],
          ],
          threshold: 0.004396575968712568,
          right_val: -0.5917593836784363,
          left_val: 0.054753091186285,
        },
        {
          features: [
            [12, 13, 1, 3, -1],
            [12, 14, 1, 1, 3],
          ],
          threshold: 0.00189528102055192,
          right_val: -0.6490725874900818,
          left_val: 0.0401207096874714,
        },
        {
          features: [
            [5, 10, 1, 3, -1],
            [5, 11, 1, 1, 3],
          ],
          threshold: -0.0013425230281427503,
          right_val: -0.1100924015045166,
          left_val: 0.3032169938087463,
        },
        {
          features: [
            [6, 6, 6, 14, -1],
            [9, 6, 3, 14, 2],
          ],
          threshold: -0.0464057400822639,
          right_val: 0.0703070312738419,
          left_val: -0.4602647125720978,
        },
        {
          features: [
            [5, 11, 6, 3, -1],
            [8, 11, 3, 3, 2],
          ],
          threshold: 0.0258755497634411,
          right_val: -0.6484752297401428,
          left_val: 0.0389873199164867,
        },
        {
          features: [
            [5, 7, 2, 4, -1],
            [6, 7, 1, 4, 2],
          ],
          threshold: 0.0010986380511894822,
          right_val: 0.1813354045152664,
          left_val: -0.16458760201931,
        },
        {
          features: [
            [7, 3, 11, 9, -1],
            [7, 6, 11, 3, 3],
          ],
          threshold: -0.00039583959733136,
          right_val: -0.2755435109138489,
          left_val: 0.0978056564927101,
        },
        {
          features: [
            [10, 4, 9, 6, -1],
            [10, 6, 9, 2, 3],
          ],
          threshold: -0.0456339903175831,
          right_val: 0.0548557713627815,
          left_val: -0.5427601933479309,
        },
        {
          features: [
            [8, 5, 2, 3, -1],
            [8, 6, 2, 1, 3],
          ],
          threshold: -0.0047068470157682896,
          right_val: -0.0696870908141136,
          left_val: 0.4096142053604126,
        },
        {
          features: [
            [0, 0, 3, 1, -1],
            [1, 0, 1, 1, 3],
          ],
          threshold: 0.00020004810357932,
          right_val: -0.2109135985374451,
          left_val: 0.1290896981954575,
        },
        {
          features: [
            [9, 4, 4, 6, -1],
            [9, 4, 2, 3, 2],
            [11, 7, 2, 3, 2],
          ],
          threshold: 0.0011126570170745254,
          right_val: 0.124585896730423,
          left_val: -0.2221307009458542,
        },
        {
          features: [
            [5, 9, 3, 1, -1],
            [6, 9, 1, 1, 3],
          ],
          threshold: -0.0014747029636055231,
          right_val: -0.0907562375068665,
          left_val: 0.2918517887592316,
        },
        {
          features: [
            [6, 4, 3, 2, -1],
            [7, 4, 1, 2, 3],
          ],
          threshold: 0.00431629316881299,
          right_val: -0.5106865167617798,
          left_val: 0.0615429095923901,
        },
        {
          features: [
            [7, 14, 1, 3, -1],
            [7, 15, 1, 1, 3],
          ],
          threshold: 0.00020302709890529513,
          right_val: 0.1646644026041031,
          left_val: -0.1563991010189056,
        },
        {
          features: [
            [1, 3, 1, 2, -1],
            [1, 4, 1, 1, 2],
          ],
          threshold: 0.00034639390651136637,
          right_val: -0.2553279995918274,
          left_val: 0.1077354028820992,
        },
        {
          features: [
            [7, 16, 2, 3, -1],
            [7, 17, 2, 1, 3],
          ],
          threshold: 0.0015631220303475857,
          right_val: 0.254503607749939,
          left_val: -0.0954280197620392,
        },
        {
          features: [
            [19, 6, 1, 2, -1],
            [19, 7, 1, 1, 2],
          ],
          threshold: 0.0005547691835090518,
          right_val: -0.3079142868518829,
          left_val: 0.0797742530703545,
        },
        {
          features: [
            [6, 15, 2, 3, -1],
            [6, 16, 2, 1, 3],
          ],
          threshold: 0.0027690480928868055,
          right_val: 0.3019863963127136,
          left_val: -0.0919008925557137,
        },
        {
          features: [
            [11, 13, 1, 3, -1],
            [11, 14, 1, 1, 3],
          ],
          threshold: 0.0011085179867222905,
          right_val: -0.4168049097061157,
          left_val: 0.0626248866319656,
        },
        {
          features: [
            [17, 10, 3, 1, -1],
            [18, 10, 1, 1, 3],
          ],
          threshold: 0.003428838914260268,
          right_val: 0.4729351997375488,
          left_val: -0.0574735589325428,
        },
        {
          features: [
            [10, 0, 6, 1, -1],
            [13, 0, 3, 1, 2],
          ],
          threshold: -0.002023379085585475,
          right_val: 0.1080666035413742,
          left_val: -0.2412866055965424,
        },
        {
          features: [
            [14, 0, 6, 4, -1],
            [14, 0, 3, 2, 2],
            [17, 2, 3, 2, 2],
          ],
          threshold: -0.0009144641808234155,
          right_val: -0.1603191941976547,
          left_val: 0.1799096018075943,
        },
        {
          features: [
            [12, 7, 4, 6, -1],
            [12, 10, 4, 3, 2],
          ],
          threshold: 0.0388806909322739,
          right_val: -0.640853226184845,
          left_val: 0.0391326211392879,
        },
        {
          features: [
            [14, 5, 1, 2, -1],
            [14, 6, 1, 1, 2],
          ],
          threshold: 0.001283606979995966,
          right_val: -0.4391455948352814,
          left_val: 0.0529120489954948,
        },
        {
          features: [
            [6, 13, 4, 3, -1],
            [6, 14, 4, 1, 3],
          ],
          threshold: 0.003582821926102042,
          right_val: 0.3077293038368225,
          left_val: -0.0974621623754501,
        },
        {
          features: [
            [5, 12, 4, 3, -1],
            [5, 13, 4, 1, 3],
          ],
          threshold: 0.00232035294175148,
          right_val: 0.2673572897911072,
          left_val: -0.1092979982495308,
        },
        {
          features: [
            [9, 3, 2, 1, -1],
            [10, 3, 1, 1, 2],
          ],
          threshold: 0.00011978139809798449,
          right_val: -0.2358634024858475,
          left_val: 0.1162312999367714,
        },
        {
          features: [
            [9, 3, 3, 3, -1],
            [10, 3, 1, 3, 3],
          ],
          threshold: -0.002825927920639515,
          right_val: 0.0570084005594254,
          left_val: -0.4193572998046875,
        },
        {
          features: [
            [9, 5, 3, 1, -1],
            [10, 5, 1, 1, 3],
          ],
          threshold: 0.0024410230107605457,
          right_val: -0.5336285829544067,
          left_val: 0.0427068807184696,
        },
        {
          features: [
            [7, 8, 4, 3, -1],
            [7, 9, 4, 1, 3],
          ],
          threshold: 0.002689965069293976,
          right_val: 0.247790202498436,
          left_val: -0.1135182976722717,
        },
        {
          features: [
            [1, 4, 1, 6, -1],
            [1, 6, 1, 2, 3],
          ],
          threshold: -0.003108175005763769,
          right_val: 0.082543209195137,
          left_val: -0.2948892116546631,
        },
        {
          features: [
            [3, 2, 3, 11, -1],
            [4, 2, 1, 11, 3],
          ],
          threshold: -0.006621074862778187,
          right_val: -0.1144362017512322,
          left_val: 0.2295868992805481,
        },
        {
          features: [
            [3, 2, 3, 18, -1],
            [4, 2, 1, 18, 3],
          ],
          threshold: 0.004678640980273485,
          right_val: 0.2677769958972931,
          left_val: -0.1287520974874497,
        },
        {
          features: [
            [5, 12, 6, 2, -1],
            [8, 12, 3, 2, 2],
          ],
          threshold: -0.0012973829871043563,
          right_val: 0.0964717268943787,
          left_val: -0.2728042900562286,
        },
        {
          features: [
            [6, 11, 2, 3, -1],
            [6, 12, 2, 1, 3],
          ],
          threshold: 0.0029523740522563457,
          right_val: 0.2920745015144348,
          left_val: -0.0870406925678253,
        },
        {
          features: [
            [7, 17, 3, 1, -1],
            [8, 17, 1, 1, 3],
          ],
          threshold: -0.0016173559706658125,
          right_val: 0.0653864666819572,
          left_val: -0.4020785093307495,
        },
        {
          features: [
            [3, 10, 8, 6, -1],
            [3, 13, 8, 3, 2],
          ],
          threshold: -0.0754177570343018,
          right_val: 0.0246026907116175,
          left_val: -0.8972333073616028,
        },
        {
          features: [
            [3, 2, 3, 17, -1],
            [4, 2, 1, 17, 3],
          ],
          threshold: -0.0025402200408279896,
          right_val: -0.1502546072006226,
          left_val: 0.152586504817009,
        },
        {
          features: [
            [4, 9, 8, 1, -1],
            [8, 9, 4, 1, 2],
          ],
          threshold: 0.003786466084420681,
          right_val: -0.3388194143772125,
          left_val: 0.0764772072434425,
        },
        {
          features: [
            [2, 7, 3, 6, -1],
            [3, 7, 1, 6, 3],
          ],
          threshold: -0.0140055101364851,
          right_val: -0.0590039305388927,
          left_val: 0.4442639052867889,
        },
        {
          features: [
            [18, 4, 1, 2, -1],
            [18, 5, 1, 1, 2],
          ],
          threshold: 0.0005595650873146951,
          right_val: -0.3560470938682556,
          left_val: 0.074007123708725,
        },
        {
          features: [
            [7, 8, 2, 6, -1],
            [7, 10, 2, 2, 3],
          ],
          threshold: 0.0002594685065560043,
          right_val: 0.0873992070555687,
          left_val: -0.2812618911266327,
        },
        {
          features: [
            [11, 12, 2, 3, -1],
            [11, 13, 2, 1, 3],
          ],
          threshold: 0.004440923221409321,
          right_val: -0.7728418707847595,
          left_val: 0.0286236591637135,
        },
        {
          features: [
            [16, 11, 3, 1, -1],
            [17, 11, 1, 1, 3],
          ],
          threshold: -0.002334356075152755,
          right_val: -0.0712075382471085,
          left_val: 0.3546060025691986,
        },
        {
          features: [
            [16, 11, 3, 2, -1],
            [17, 11, 1, 2, 3],
          ],
          threshold: 0.0009765495196916163,
          right_val: 0.2254537045955658,
          left_val: -0.101384200155735,
        },
        {
          features: [
            [15, 3, 1, 4, -1],
            [15, 5, 1, 2, 2],
          ],
          threshold: -0.00043227209243923426,
          right_val: 0.1227314993739128,
          left_val: -0.210958793759346,
        },
      ],
      threshold: -1.7268099784851074,
    },
    {
      simpleClassifiers: [
        {
          features: [
            [11, 0, 9, 11, -1],
            [14, 0, 3, 11, 3],
          ],
          threshold: -0.0124802095815539,
          right_val: -0.4700151979923248,
          left_val: 0.2611210942268372,
        },
        {
          features: [
            [7, 0, 5, 6, -1],
            [7, 3, 5, 3, 2],
          ],
          threshold: 0.0354509614408016,
          right_val: 0.4771861135959625,
          left_val: -0.2000845968723297,
        },
        {
          features: [
            [8, 7, 2, 6, -1],
            [8, 10, 2, 3, 2],
          ],
          threshold: 0.0020369330886751413,
          right_val: 0.1513264030218124,
          left_val: -0.4770315885543823,
        },
        {
          features: [
            [11, 11, 4, 6, -1],
            [11, 14, 4, 3, 2],
          ],
          threshold: -0.00004394642019178718,
          right_val: -0.5179628729820251,
          left_val: 0.1228848025202751,
        },
        {
          features: [
            [4, 7, 3, 2, -1],
            [5, 7, 1, 2, 3],
          ],
          threshold: -0.0038480788934975863,
          right_val: -0.1459532976150513,
          left_val: 0.4111368060112,
        },
        {
          features: [
            [3, 7, 3, 2, -1],
            [4, 7, 1, 2, 3],
          ],
          threshold: -0.002831655088812113,
          right_val: -0.1762959957122803,
          left_val: 0.2871097028255463,
        },
        {
          features: [
            [11, 11, 2, 3, -1],
            [11, 12, 2, 1, 3],
          ],
          threshold: 0.002502608112990856,
          right_val: -0.5780801177024841,
          left_val: 0.0796688422560692,
        },
        {
          features: [
            [5, 9, 4, 6, -1],
            [5, 12, 4, 3, 2],
          ],
          threshold: 0.0003081295872107148,
          right_val: -0.4254018068313599,
          left_val: 0.0828387066721916,
        },
        {
          features: [
            [16, 4, 2, 3, -1],
            [17, 4, 1, 3, 2],
          ],
          threshold: 0.0006118696182966232,
          right_val: -0.3059141933917999,
          left_val: 0.1364181041717529,
        },
        {
          features: [
            [12, 12, 2, 1, -1],
            [13, 12, 1, 1, 2],
          ],
          threshold: -0.000014354350241774227,
          right_val: -0.2568199932575226,
          left_val: 0.1419748961925507,
        },
        {
          features: [
            [8, 5, 6, 4, -1],
            [8, 5, 3, 2, 2],
            [11, 7, 3, 2, 2],
          ],
          threshold: 0.0016148330178111792,
          right_val: 0.1328839063644409,
          left_val: -0.2623932957649231,
        },
        {
          features: [
            [10, 15, 3, 3, -1],
            [11, 15, 1, 3, 3],
          ],
          threshold: 0.0020318101160228252,
          right_val: -0.4314146041870117,
          left_val: 0.0757495686411858,
        },
        {
          features: [
            [3, 7, 3, 7, -1],
            [4, 7, 1, 7, 3],
          ],
          threshold: 0.009556367993354797,
          right_val: 0.4000456929206848,
          left_val: -0.0914244800806046,
        },
        {
          features: [
            [11, 4, 1, 2, -1],
            [11, 5, 1, 1, 2],
          ],
          threshold: -0.0007843956118449569,
          right_val: 0.0917778164148331,
          left_val: -0.3661993145942688,
        },
        {
          features: [
            [3, 9, 3, 5, -1],
            [4, 9, 1, 5, 3],
          ],
          threshold: -0.003966113086789846,
          right_val: -0.142816498875618,
          left_val: 0.2369821071624756,
        },
        {
          features: [
            [10, 15, 3, 3, -1],
            [11, 15, 1, 3, 3],
          ],
          threshold: -0.002319446997717023,
          right_val: 0.0786841064691544,
          left_val: -0.4224534034729004,
        },
        {
          features: [
            [3, 3, 6, 12, -1],
            [3, 9, 6, 6, 2],
          ],
          threshold: -0.0734902024269104,
          right_val: 0.0404968708753586,
          left_val: -0.6221855282783508,
        },
        {
          features: [
            [3, 5, 5, 6, -1],
            [3, 7, 5, 2, 3],
          ],
          threshold: -0.003680317895486951,
          right_val: -0.2099042981863022,
          left_val: 0.1261202991008759,
        },
        {
          features: [
            [6, 6, 4, 11, -1],
            [8, 6, 2, 11, 2],
          ],
          threshold: -0.0410192906856537,
          right_val: 0.0279939491301775,
          left_val: -0.8031694293022156,
        },
        {
          features: [
            [6, 5, 2, 6, -1],
            [7, 5, 1, 6, 2],
          ],
          threshold: -0.00048213129048235714,
          right_val: -0.1786963045597076,
          left_val: 0.1482598036527634,
        },
        {
          features: [
            [2, 6, 3, 8, -1],
            [3, 6, 1, 8, 3],
          ],
          threshold: -0.0165982507169247,
          right_val: -0.0640516877174377,
          left_val: 0.4144228100776672,
        },
        {
          features: [
            [6, 4, 3, 1, -1],
            [7, 4, 1, 1, 3],
          ],
          threshold: -0.0010631670011207461,
          right_val: 0.0824259966611862,
          left_val: -0.3346652090549469,
        },
        {
          features: [
            [5, 10, 2, 3, -1],
            [5, 11, 2, 1, 3],
          ],
          threshold: 0.00186584098264575,
          right_val: 0.2318338006734848,
          left_val: -0.1311978995800018,
        },
        {
          features: [
            [5, 10, 1, 3, -1],
            [5, 11, 1, 1, 3],
          ],
          threshold: -0.0025827190838754177,
          right_val: -0.0841216668486595,
          left_val: 0.3841595053672791,
        },
        {
          features: [
            [13, 14, 2, 3, -1],
            [13, 15, 2, 1, 3],
          ],
          threshold: 0.001715961960144341,
          right_val: -0.410989910364151,
          left_val: 0.0769715383648872,
        },
        {
          features: [
            [10, 11, 2, 3, -1],
            [10, 12, 2, 1, 3],
          ],
          threshold: -0.003914018161594868,
          right_val: 0.038418460637331,
          left_val: -0.6250861883163452,
        },
        {
          features: [
            [19, 5, 1, 3, -1],
            [19, 6, 1, 1, 3],
          ],
          threshold: 0.00042724498780444264,
          right_val: -0.2697522938251495,
          left_val: 0.0860165730118752,
        },
        {
          features: [
            [5, 14, 5, 3, -1],
            [5, 15, 5, 1, 3],
          ],
          threshold: 0.003399292007088661,
          right_val: 0.2703082859516144,
          left_val: -0.1017651036381722,
        },
        {
          features: [
            [4, 10, 10, 4, -1],
            [9, 10, 5, 4, 2],
          ],
          threshold: -0.0364572815597057,
          right_val: 0.0558542497456074,
          left_val: -0.4926198124885559,
        },
        {
          features: [
            [12, 12, 2, 3, -1],
            [12, 13, 2, 1, 3],
          ],
          threshold: 0.0016230379696935415,
          right_val: -0.4205349981784821,
          left_val: 0.0575670786201954,
        },
        {
          features: [
            [5, 13, 4, 3, -1],
            [5, 14, 4, 1, 3],
          ],
          threshold: 0.004665554966777563,
          right_val: 0.3209528028964996,
          left_val: -0.0911583974957466,
        },
        {
          features: [
            [6, 12, 3, 3, -1],
            [6, 13, 3, 1, 3],
          ],
          threshold: 0.0031331549398601055,
          right_val: 0.3407345116138458,
          left_val: -0.0969326570630074,
        },
        {
          features: [
            [6, 15, 3, 2, -1],
            [7, 15, 1, 2, 3],
          ],
          threshold: -0.0016835830174386501,
          right_val: 0.0822260826826096,
          left_val: -0.3676624894142151,
        },
        {
          features: [
            [4, 11, 8, 2, -1],
            [8, 11, 4, 2, 2],
          ],
          threshold: 0.0277286507189274,
          right_val: -0.651983916759491,
          left_val: 0.0401174984872341,
        },
        {
          features: [
            [14, 3, 6, 8, -1],
            [14, 7, 6, 4, 2],
          ],
          threshold: 0.0950153097510338,
          right_val: -0.8888198137283325,
          left_val: 0.0230651199817657,
        },
        {
          features: [
            [8, 5, 12, 5, -1],
            [12, 5, 4, 5, 3],
          ],
          threshold: 0.0747556164860725,
          right_val: 0.4739970862865448,
          left_val: -0.0639468729496002,
        },
        {
          features: [
            [5, 14, 6, 2, -1],
            [7, 14, 2, 2, 3],
          ],
          threshold: 0.0166933406144381,
          right_val: -0.7115241885185242,
          left_val: 0.0464772582054138,
        },
        {
          features: [
            [6, 11, 2, 3, -1],
            [6, 12, 2, 1, 3],
          ],
          threshold: 0.001208876958116889,
          right_val: 0.2242414951324463,
          left_val: -0.1135926991701126,
        },
        {
          features: [
            [13, 12, 1, 3, -1],
            [13, 13, 1, 1, 3],
          ],
          threshold: -0.0006175151793286204,
          right_val: 0.0850189328193665,
          left_val: -0.3126823008060455,
        },
        {
          features: [
            [6, 3, 14, 12, -1],
            [6, 3, 7, 6, 2],
            [13, 9, 7, 6, 2],
          ],
          threshold: 0.008578669279813766,
          right_val: 0.1564093977212906,
          left_val: -0.155594602227211,
        },
        {
          features: [
            [18, 6, 2, 2, -1],
            [18, 7, 2, 1, 2],
          ],
          threshold: 0.0006118476740084589,
          right_val: -0.2652013897895813,
          left_val: 0.094403937458992,
        },
        {
          features: [
            [14, 7, 6, 10, -1],
            [16, 7, 2, 10, 3],
          ],
          threshold: -0.003457044018432498,
          right_val: -0.1622052937746048,
          left_val: 0.1514606028795242,
        },
        {
          features: [
            [9, 8, 2, 3, -1],
            [9, 9, 2, 1, 3],
          ],
          threshold: 0.0013953070156276226,
          right_val: 0.2499831020832062,
          left_val: -0.0999962165951729,
        },
        {
          features: [
            [0, 6, 2, 4, -1],
            [0, 8, 2, 2, 2],
          ],
          threshold: 0.0035910680890083313,
          right_val: -0.3008154928684235,
          left_val: 0.0810116827487946,
        },
        {
          features: [
            [9, 0, 6, 2, -1],
            [11, 0, 2, 2, 3],
          ],
          threshold: 0.005419283173978329,
          right_val: -0.3235566020011902,
          left_val: 0.0676500424742699,
        },
        {
          features: [
            [12, 0, 8, 2, -1],
            [12, 0, 4, 1, 2],
            [16, 1, 4, 1, 2],
          ],
          threshold: -0.0011379310162737966,
          right_val: -0.1272972971200943,
          left_val: 0.1888744980096817,
        },
        {
          features: [
            [3, 10, 14, 6, -1],
            [3, 12, 14, 2, 3],
          ],
          threshold: 0.009104725904762745,
          right_val: -0.2228015065193176,
          left_val: 0.1016054004430771,
        },
        {
          features: [
            [6, 7, 3, 4, -1],
            [7, 7, 1, 4, 3],
          ],
          threshold: 0.006505017168819904,
          right_val: 0.3577027022838593,
          left_val: -0.0729864165186882,
        },
        {
          features: [
            [10, 13, 2, 1, -1],
            [11, 13, 1, 1, 2],
          ],
          threshold: -0.000014676549653813709,
          right_val: -0.1740354001522064,
          left_val: 0.1469310969114304,
        },
        {
          features: [
            [11, 6, 5, 10, -1],
            [11, 11, 5, 5, 2],
          ],
          threshold: -0.009440315887331963,
          right_val: 0.0966195464134216,
          left_val: -0.2653675079345703,
        },
        {
          features: [
            [3, 16, 4, 4, -1],
            [3, 16, 2, 2, 2],
            [5, 18, 2, 2, 2],
          ],
          threshold: -0.004293330013751984,
          right_val: -0.1055020987987518,
          left_val: 0.2565683126449585,
        },
        {
          features: [
            [6, 2, 3, 3, -1],
            [7, 2, 1, 3, 3],
          ],
          threshold: 0.004313317127525806,
          right_val: -0.4571993947029114,
          left_val: 0.0659365728497505,
        },
        {
          features: [
            [4, 0, 8, 20, -1],
            [4, 0, 4, 10, 2],
            [8, 10, 4, 10, 2],
          ],
          threshold: 0.0588544681668282,
          right_val: -0.3307807147502899,
          left_val: 0.0679182633757591,
        },
        {
          features: [
            [3, 16, 3, 4, -1],
            [4, 16, 1, 4, 3],
          ],
          threshold: -0.0028407620266079903,
          right_val: -0.0920921564102173,
          left_val: 0.239535003900528,
        },
        {
          features: [
            [3, 16, 3, 1, -1],
            [4, 16, 1, 1, 3],
          ],
          threshold: 0.0009635994210839272,
          right_val: 0.264629989862442,
          left_val: -0.1098238006234169,
        },
        {
          features: [
            [11, 13, 1, 2, -1],
            [11, 14, 1, 1, 2],
          ],
          threshold: -0.000014724590073456056,
          right_val: -0.2270458042621613,
          left_val: 0.1111116036772728,
        },
        {
          features: [
            [11, 13, 1, 3, -1],
            [11, 14, 1, 1, 3],
          ],
          threshold: -0.0008067546878010035,
          right_val: 0.078122653067112,
          left_val: -0.3633514046669006,
        },
        {
          features: [
            [6, 19, 14, 1, -1],
            [13, 19, 7, 1, 2],
          ],
          threshold: 0.0007329619838856161,
          right_val: 0.1518490016460419,
          left_val: -0.15605129301548,
        },
        {
          features: [
            [5, 7, 3, 3, -1],
            [6, 7, 1, 3, 3],
          ],
          threshold: 0.0063753738068044186,
          right_val: 0.2972387969493866,
          left_val: -0.07195795327425,
        },
        {
          features: [
            [7, 4, 3, 2, -1],
            [8, 4, 1, 2, 3],
          ],
          threshold: 0.004639057908207178,
          right_val: -0.6113234758377075,
          left_val: 0.0359696000814438,
        },
        {
          features: [
            [9, 18, 2, 1, -1],
            [10, 18, 1, 1, 2],
          ],
          threshold: -0.0007107927231118083,
          right_val: 0.0693146288394928,
          left_val: -0.288068413734436,
        },
        {
          features: [
            [6, 17, 2, 3, -1],
            [6, 18, 2, 1, 3],
          ],
          threshold: 0.0029162289574742317,
          right_val: 0.3268168866634369,
          left_val: -0.0759684592485428,
        },
        {
          features: [
            [9, 7, 3, 6, -1],
            [9, 9, 3, 2, 3],
          ],
          threshold: -0.0178531408309937,
          right_val: -0.0481740310788155,
          left_val: 0.4420630931854248,
        },
        {
          features: [
            [9, 12, 3, 7, -1],
            [10, 12, 1, 7, 3],
          ],
          threshold: 0.008387498557567596,
          right_val: -0.5441532731056213,
          left_val: 0.0489138998091221,
        },
        {
          features: [
            [8, 9, 1, 3, -1],
            [8, 10, 1, 1, 3],
          ],
          threshold: 0.00002945832056866493,
          right_val: 0.1062937006354332,
          left_val: -0.211312398314476,
        },
        {
          features: [
            [8, 5, 12, 11, -1],
            [12, 5, 4, 11, 3],
          ],
          threshold: -0.0981927067041397,
          right_val: -0.0692968666553497,
          left_val: 0.3531824052333832,
        },
        {
          features: [
            [2, 0, 1, 2, -1],
            [2, 1, 1, 1, 2],
          ],
          threshold: 0.0004614036879502237,
          right_val: -0.2581192851066589,
          left_val: 0.096270777285099,
        },
        {
          features: [
            [0, 0, 1, 2, -1],
            [0, 1, 1, 1, 2],
          ],
          threshold: -0.00024016610404942185,
          right_val: 0.0999848917126656,
          left_val: -0.2297642976045609,
        },
        {
          features: [
            [8, 0, 12, 16, -1],
            [12, 0, 4, 16, 3],
          ],
          threshold: 0.0378824807703495,
          right_val: 0.2316477000713348,
          left_val: -0.1036543995141983,
        },
        {
          features: [
            [0, 0, 1, 2, -1],
            [0, 1, 1, 1, 2],
          ],
          threshold: 0.0003262158134020865,
          right_val: -0.2368970066308975,
          left_val: 0.0979339405894279,
        },
      ],
      threshold: -1.6056820154190063,
    },
    {
      simpleClassifiers: [
        {
          features: [
            [11, 0, 9, 11, -1],
            [14, 0, 3, 11, 3],
          ],
          threshold: -0.0367441214621067,
          right_val: -0.317798912525177,
          left_val: 0.3407934010028839,
        },
        {
          features: [
            [5, 5, 3, 6, -1],
            [6, 5, 1, 6, 3],
          ],
          threshold: 0.0021955010015517473,
          right_val: 0.2586979866027832,
          left_val: -0.2872959077358246,
        },
        {
          features: [
            [8, 8, 3, 4, -1],
            [8, 10, 3, 2, 2],
          ],
          threshold: 0.008303483948111534,
          right_val: 0.2675926983356476,
          left_val: -0.2180044949054718,
        },
        {
          features: [
            [13, 2, 6, 12, -1],
            [13, 8, 6, 6, 2],
          ],
          threshold: 0.002628942020237446,
          right_val: 0.1463983952999115,
          left_val: -0.3600608110427856,
        },
        {
          features: [
            [10, 6, 4, 14, -1],
            [10, 13, 4, 7, 2],
          ],
          threshold: 0.0019458869937807322,
          right_val: -0.4205875992774963,
          left_val: 0.1367772072553635,
        },
        {
          features: [
            [1, 1, 10, 1, -1],
            [6, 1, 5, 1, 2],
          ],
          threshold: -0.0217043906450272,
          right_val: -0.0980915725231171,
          left_val: 0.4890331923961639,
        },
        {
          features: [
            [4, 2, 13, 6, -1],
            [4, 4, 13, 2, 3],
          ],
          threshold: 0.004295642022043467,
          right_val: 0.1571262925863266,
          left_val: -0.2782556116580963,
        },
        {
          features: [
            [11, 13, 2, 3, -1],
            [12, 13, 1, 3, 2],
          ],
          threshold: 0.0004989462904632092,
          right_val: -0.3377942144870758,
          left_val: 0.1100381016731262,
        },
        {
          features: [
            [6, 9, 4, 9, -1],
            [6, 12, 4, 3, 3],
          ],
          threshold: 0.0246527995914221,
          right_val: -0.5471053719520569,
          left_val: 0.0458206608891487,
        },
        {
          features: [
            [6, 6, 3, 10, -1],
            [6, 11, 3, 5, 2],
          ],
          threshold: -0.0230757407844067,
          right_val: 0.0670447796583176,
          left_val: -0.4980142116546631,
        },
        {
          features: [
            [2, 10, 3, 4, -1],
            [3, 10, 1, 4, 3],
          ],
          threshold: 0.011991280131042,
          right_val: 0.4829424917697907,
          left_val: -0.0708770230412483,
        },
        {
          features: [
            [3, 8, 3, 6, -1],
            [4, 8, 1, 6, 3],
          ],
          threshold: 0.0154306795448065,
          right_val: 0.4523684978485107,
          left_val: -0.0659497380256653,
        },
        {
          features: [
            [11, 12, 3, 6, -1],
            [12, 12, 1, 6, 3],
          ],
          threshold: -0.0045555769465863705,
          right_val: 0.0678776577115059,
          left_val: -0.4466569125652313,
        },
        {
          features: [
            [8, 6, 2, 3, -1],
            [8, 7, 2, 1, 3],
          ],
          threshold: -0.004458297975361347,
          right_val: -0.0947923585772514,
          left_val: 0.3365691900253296,
        },
        {
          features: [
            [5, 8, 6, 6, -1],
            [5, 8, 3, 3, 2],
            [8, 11, 3, 3, 2],
          ],
          threshold: 0.00013494009908754379,
          right_val: 0.1029383018612862,
          left_val: -0.3028885126113892,
        },
        {
          features: [
            [3, 7, 3, 1, -1],
            [4, 7, 1, 1, 3],
          ],
          threshold: -0.004250018857419491,
          right_val: -0.072956383228302,
          left_val: 0.42550128698349,
        },
        {
          features: [
            [10, 12, 3, 3, -1],
            [10, 13, 3, 1, 3],
          ],
          threshold: -0.001429375959560275,
          right_val: 0.0900392532348633,
          left_val: -0.3011676073074341,
        },
        {
          features: [
            [5, 11, 2, 3, -1],
            [5, 12, 2, 1, 3],
          ],
          threshold: -0.006397855002433062,
          right_val: -0.0793208703398705,
          left_val: 0.4194355010986328,
        },
        {
          features: [
            [10, 12, 4, 3, -1],
            [10, 13, 4, 1, 3],
          ],
          threshold: 0.0026083870325237513,
          right_val: -0.4189716875553131,
          left_val: 0.0835989266633987,
        },
        {
          features: [
            [5, 11, 3, 3, -1],
            [5, 12, 3, 1, 3],
          ],
          threshold: 0.008687080815434456,
          right_val: 0.5264474153518677,
          left_val: -0.0630156993865967,
        },
        {
          features: [
            [9, 2, 3, 1, -1],
            [10, 2, 1, 1, 3],
          ],
          threshold: -0.0010380990570411086,
          right_val: 0.0803010389208794,
          left_val: -0.3622015118598938,
        },
        {
          features: [
            [2, 0, 18, 14, -1],
            [2, 7, 18, 7, 2],
          ],
          threshold: 0.440700501203537,
          right_val: -0.7276449203491211,
          left_val: 0.0349130593240261,
        },
        {
          features: [
            [9, 2, 3, 2, -1],
            [10, 2, 1, 2, 3],
          ],
          threshold: 0.003368952078744769,
          right_val: -0.4863327145576477,
          left_val: 0.0573327802121639,
        },
        {
          features: [
            [8, 6, 4, 3, -1],
            [8, 7, 4, 1, 3],
          ],
          threshold: 0.0017443710239604115,
          right_val: 0.2702358067035675,
          left_val: -0.1099466010928154,
        },
        {
          features: [
            [4, 8, 5, 2, -1],
            [4, 9, 5, 1, 2],
          ],
          threshold: 0.0005378869827836752,
          right_val: 0.1006338000297546,
          left_val: -0.2743942141532898,
        },
        {
          features: [
            [0, 3, 1, 6, -1],
            [0, 5, 1, 2, 3],
          ],
          threshold: 0.001007289974950254,
          right_val: -0.2322160005569458,
          left_val: 0.107567697763443,
        },
        {
          features: [
            [13, 9, 1, 6, -1],
            [13, 12, 1, 3, 2],
          ],
          threshold: -0.00825188122689724,
          right_val: 0.0357042290270329,
          left_val: -0.652163028717041,
        },
        {
          features: [
            [6, 16, 3, 3, -1],
            [6, 17, 3, 1, 3],
          ],
          threshold: 0.0035490558948367834,
          right_val: 0.3176743090152741,
          left_val: -0.0842548683285713,
        },
        {
          features: [
            [3, 16, 7, 3, -1],
            [3, 17, 7, 1, 3],
          ],
          threshold: -0.0110333599150181,
          right_val: -0.0625870525836945,
          left_val: 0.4127162098884583,
        },
        {
          features: [
            [10, 15, 5, 3, -1],
            [10, 16, 5, 1, 3],
          ],
          threshold: 0.003227843903005123,
          right_val: -0.4117225110530853,
          left_val: 0.0712669864296913,
        },
        {
          features: [
            [4, 0, 5, 20, -1],
            [4, 10, 5, 10, 2],
          ],
          threshold: 0.175403892993927,
          right_val: -0.6377506852149963,
          left_val: 0.0349589809775352,
        },
        {
          features: [
            [6, 2, 2, 2, -1],
            [7, 2, 1, 2, 2],
          ],
          threshold: -0.00048067080206237733,
          right_val: 0.098930649459362,
          left_val: -0.2450311034917831,
        },
        {
          features: [
            [18, 0, 2, 15, -1],
            [18, 5, 2, 5, 3],
          ],
          threshold: -0.0018284550169482827,
          right_val: -0.1979990005493164,
          left_val: 0.1348651945590973,
        },
        {
          features: [
            [6, 15, 7, 3, -1],
            [6, 16, 7, 1, 3],
          ],
          threshold: 0.0017096720403060317,
          right_val: 0.2100570946931839,
          left_val: -0.1052595004439354,
        },
        {
          features: [
            [10, 13, 6, 2, -1],
            [10, 14, 6, 1, 2],
          ],
          threshold: 0.0003946830111090094,
          right_val: -0.2740539908409119,
          left_val: 0.0809525474905968,
        },
        {
          features: [
            [13, 8, 1, 9, -1],
            [13, 11, 1, 3, 3],
          ],
          threshold: 0.00230977195315063,
          right_val: -0.1995880007743835,
          left_val: 0.1233822032809258,
        },
        {
          features: [
            [3, 0, 4, 4, -1],
            [3, 0, 2, 2, 2],
            [5, 2, 2, 2, 2],
          ],
          threshold: 0.003152919001877308,
          right_val: 0.2208960056304932,
          left_val: -0.106125496327877,
        },
        {
          features: [
            [0, 3, 1, 6, -1],
            [0, 5, 1, 2, 3],
          ],
          threshold: -0.0019097010372206569,
          right_val: 0.0870225802063942,
          left_val: -0.2509470880031586,
        },
        {
          features: [
            [5, 8, 3, 1, -1],
            [6, 8, 1, 1, 3],
          ],
          threshold: -0.001237060991115868,
          right_val: -0.0759372934699059,
          left_val: 0.3076052069664002,
        },
        {
          features: [
            [5, 6, 2, 3, -1],
            [6, 6, 1, 3, 2],
          ],
          threshold: 0.0003708109143190086,
          right_val: 0.1348019987344742,
          left_val: -0.1606508046388626,
        },
        {
          features: [
            [6, 11, 6, 7, -1],
            [8, 11, 2, 7, 3],
          ],
          threshold: 0.0342688485980034,
          right_val: -0.6354715824127197,
          left_val: 0.0352609492838383,
        },
        {
          features: [
            [8, 7, 4, 3, -1],
            [8, 8, 4, 1, 3],
          ],
          threshold: 0.004666468128561974,
          right_val: 0.4324232041835785,
          left_val: -0.0524948611855507,
        },
        {
          features: [
            [3, 8, 8, 1, -1],
            [7, 8, 4, 1, 2],
          ],
          threshold: 0.0104235699400306,
          right_val: -0.5074523091316223,
          left_val: 0.0516124293208122,
        },
        {
          features: [
            [5, 12, 3, 3, -1],
            [5, 13, 3, 1, 3],
          ],
          threshold: 0.0112151801586151,
          right_val: 0.5764592885971069,
          left_val: -0.0386142507195473,
        },
        {
          features: [
            [9, 7, 2, 8, -1],
            [9, 7, 1, 4, 2],
            [10, 11, 1, 4, 2],
          ],
          threshold: -0.0000073029109444178175,
          right_val: -0.1727436929941177,
          left_val: 0.1205231994390488,
        },
        {
          features: [
            [14, 2, 3, 5, -1],
            [15, 2, 1, 5, 3],
          ],
          threshold: -0.004907280206680298,
          right_val: 0.0591164417564869,
          left_val: -0.3481855094432831,
        },
        {
          features: [
            [6, 13, 2, 3, -1],
            [6, 14, 2, 1, 3],
          ],
          threshold: 0.0019488829420879483,
          right_val: 0.2402089983224869,
          left_val: -0.0888612270355225,
        },
        {
          features: [
            [6, 14, 1, 2, -1],
            [6, 15, 1, 1, 2],
          ],
          threshold: 0.00013313010276760906,
          right_val: 0.1992992013692856,
          left_val: -0.1465771943330765,
        },
        {
          features: [
            [12, 10, 2, 3, -1],
            [12, 11, 2, 1, 3],
          ],
          threshold: -0.001429824042133987,
          right_val: 0.0599094182252884,
          left_val: -0.3900522887706757,
        },
        {
          features: [
            [1, 14, 12, 3, -1],
            [5, 14, 4, 3, 3],
          ],
          threshold: -0.006483145989477634,
          right_val: -0.1165544986724854,
          left_val: 0.1814136952161789,
        },
        {
          features: [
            [11, 8, 3, 1, -1],
            [12, 8, 1, 1, 3],
          ],
          threshold: 0.000007295850082300603,
          right_val: 0.1181278005242348,
          left_val: -0.182192400097847,
        },
        {
          features: [
            [14, 4, 2, 3, -1],
            [14, 5, 2, 1, 3],
          ],
          threshold: 0.00041690681246109307,
          right_val: -0.2035371065139771,
          left_val: 0.1059167981147766,
        },
        {
          features: [
            [7, 8, 3, 2, -1],
            [8, 8, 1, 2, 3],
          ],
          threshold: 0.005198205821216106,
          right_val: 0.6026421189308167,
          left_val: -0.0359626412391663,
        },
        {
          features: [
            [2, 7, 3, 11, -1],
            [3, 7, 1, 11, 3],
          ],
          threshold: -0.0040649957954883575,
          right_val: -0.0985998436808586,
          left_val: 0.2069641947746277,
        },
        {
          features: [
            [0, 14, 2, 1, -1],
            [1, 14, 1, 1, 2],
          ],
          threshold: -0.00047734950203448534,
          right_val: 0.0931742712855339,
          left_val: -0.2462954968214035,
        },
        {
          features: [
            [6, 15, 3, 2, -1],
            [7, 15, 1, 2, 3],
          ],
          threshold: 0.005241516046226025,
          right_val: -0.5493478775024414,
          left_val: 0.0365285202860832,
        },
        {
          features: [
            [18, 10, 2, 4, -1],
            [18, 10, 1, 2, 2],
            [19, 12, 1, 2, 2],
          ],
          threshold: 0.0037873629480600357,
          right_val: 0.3873398005962372,
          left_val: -0.0575970895588398,
        },
        {
          features: [
            [13, 12, 2, 2, -1],
            [14, 12, 1, 2, 2],
          ],
          threshold: -0.000014434250260819681,
          right_val: -0.1744707971811295,
          left_val: 0.1129285991191864,
        },
        {
          features: [
            [9, 5, 8, 12, -1],
            [13, 5, 4, 12, 2],
          ],
          threshold: 0.0420115999877453,
          right_val: 0.4545480012893677,
          left_val: -0.0465568602085114,
        },
        {
          features: [
            [11, 5, 3, 3, -1],
            [12, 5, 1, 3, 3],
          ],
          threshold: 0.007966343313455582,
          right_val: -0.5370252132415771,
          left_val: 0.0422587394714355,
        },
        {
          features: [
            [16, 11, 2, 2, -1],
            [16, 11, 1, 1, 2],
            [17, 12, 1, 1, 2],
          ],
          threshold: 0.0005309298285283148,
          right_val: 0.2179591953754425,
          left_val: -0.0979187190532684,
        },
        {
          features: [
            [14, 5, 1, 2, -1],
            [14, 6, 1, 1, 2],
          ],
          threshold: 0.000529061071574688,
          right_val: -0.2886753976345062,
          left_val: 0.0779610574245453,
        },
        {
          features: [
            [3, 0, 8, 16, -1],
            [3, 8, 8, 8, 2],
          ],
          threshold: -0.1955624967813492,
          right_val: 0.027276000007987,
          left_val: -0.7647573947906494,
        },
        {
          features: [
            [3, 11, 3, 5, -1],
            [4, 11, 1, 5, 3],
          ],
          threshold: -0.0115599501878023,
          right_val: -0.0636149868369102,
          left_val: 0.3352600038051605,
        },
        {
          features: [
            [0, 8, 12, 6, -1],
            [4, 8, 4, 6, 3],
          ],
          threshold: -0.1400565952062607,
          right_val: 0.0280244704335928,
          left_val: -0.7623205184936523,
        },
        {
          features: [
            [6, 9, 4, 2, -1],
            [6, 9, 2, 1, 2],
            [8, 10, 2, 1, 2],
          ],
          threshold: 0.00004464328958420083,
          right_val: 0.0993916988372803,
          left_val: -0.2032092958688736,
        },
        {
          features: [
            [11, 15, 3, 5, -1],
            [12, 15, 1, 5, 3],
          ],
          threshold: 0.003941180184483528,
          right_val: -0.3758454024791718,
          left_val: 0.0499362796545029,
        },
        {
          features: [
            [18, 10, 2, 6, -1],
            [18, 10, 1, 3, 2],
            [19, 13, 1, 3, 2],
          ],
          threshold: -0.004596569109708071,
          right_val: -0.0638099312782288,
          left_val: 0.3303121030330658,
        },
        {
          features: [
            [13, 15, 6, 1, -1],
            [16, 15, 3, 1, 2],
          ],
          threshold: -0.0006979029276408255,
          right_val: -0.1319292038679123,
          left_val: 0.16093710064888,
        },
        {
          features: [
            [5, 10, 7, 6, -1],
            [5, 13, 7, 3, 2],
          ],
          threshold: 0.000618868216406554,
          right_val: -0.3302145898342133,
          left_val: 0.0746211931109428,
        },
        {
          features: [
            [2, 11, 6, 6, -1],
            [2, 14, 6, 3, 2],
          ],
          threshold: -0.0327551402151585,
          right_val: 0.0493086613714695,
          left_val: -0.4064356088638306,
        },
        {
          features: [
            [11, 14, 3, 3, -1],
            [11, 15, 3, 1, 3],
          ],
          threshold: 0.0033697509206831455,
          right_val: -0.4975732862949371,
          left_val: 0.0406270995736122,
        },
        {
          features: [
            [7, 14, 6, 3, -1],
            [7, 15, 6, 1, 3],
          ],
          threshold: 0.0003739182138815522,
          right_val: 0.1651796996593475,
          left_val: -0.1493179947137833,
        },
        {
          features: [
            [5, 14, 5, 3, -1],
            [5, 15, 5, 1, 3],
          ],
          threshold: -0.0040217190980911255,
          right_val: -0.0766421034932137,
          left_val: 0.2953197062015533,
        },
        {
          features: [
            [6, 16, 3, 1, -1],
            [7, 16, 1, 1, 3],
          ],
          threshold: -0.0007294383249245584,
          right_val: 0.0792439877986908,
          left_val: -0.273558109998703,
        },
        {
          features: [
            [4, 15, 4, 3, -1],
            [4, 16, 4, 1, 3],
          ],
          threshold: -0.005772611126303673,
          right_val: -0.0760872066020966,
          left_val: 0.3474124073982239,
        },
        {
          features: [
            [2, 2, 4, 8, -1],
            [2, 2, 2, 4, 2],
            [4, 6, 2, 4, 2],
          ],
          threshold: -0.002112245885655284,
          right_val: -0.1244447007775307,
          left_val: 0.1729051023721695,
        },
        {
          features: [
            [12, 13, 2, 3, -1],
            [12, 14, 2, 1, 3],
          ],
          threshold: 0.0044956691563129425,
          right_val: -0.7400333881378174,
          left_val: 0.0302187297493219,
        },
        {
          features: [
            [9, 13, 4, 3, -1],
            [9, 14, 4, 1, 3],
          ],
          threshold: -0.0011419389629736543,
          right_val: 0.0769115462899208,
          left_val: -0.2349448949098587,
        },
        {
          features: [
            [8, 8, 5, 3, -1],
            [8, 9, 5, 1, 3],
          ],
          threshold: 0.0027658098842948675,
          right_val: 0.2100971043109894,
          left_val: -0.0916666612029076,
        },
        {
          features: [
            [9, 12, 3, 2, -1],
            [10, 12, 1, 2, 3],
          ],
          threshold: -0.0007228184840641916,
          right_val: 0.0753781422972679,
          left_val: -0.2558746933937073,
        },
        {
          features: [
            [4, 0, 8, 2, -1],
            [4, 0, 4, 1, 2],
            [8, 1, 4, 1, 2],
          ],
          threshold: 0.0018604539800435305,
          right_val: 0.1972692012786865,
          left_val: -0.0945110693573952,
        },
        {
          features: [
            [0, 12, 1, 2, -1],
            [0, 13, 1, 1, 2],
          ],
          threshold: -0.00028568008565343916,
          right_val: 0.0972900390625,
          left_val: -0.210733100771904,
        },
        {
          features: [
            [8, 14, 8, 4, -1],
            [8, 16, 8, 2, 2],
          ],
          threshold: -0.0387961007654667,
          right_val: 0.0244103092700243,
          left_val: -0.7872459292411804,
        },
        {
          features: [
            [4, 17, 9, 3, -1],
            [4, 18, 9, 1, 3],
          ],
          threshold: -0.0121198697015643,
          right_val: -0.0579074993729591,
          left_val: 0.3646681010723114,
        },
      ],
      threshold: -1.5173089504241943,
    },
    {
      simpleClassifiers: [
        {
          features: [
            [10, 0, 2, 8, -1],
            [10, 4, 2, 4, 2],
          ],
          threshold: 0.005600853823125362,
          right_val: 0.3381746113300324,
          left_val: -0.3849158883094788,
        },
        {
          features: [
            [10, 13, 2, 6, -1],
            [10, 16, 2, 3, 2],
          ],
          threshold: -0.003720578970387578,
          right_val: -0.3067378103733063,
          left_val: 0.2461411952972412,
        },
        {
          features: [
            [7, 2, 10, 5, -1],
            [12, 2, 5, 5, 2],
          ],
          threshold: -0.0025333440862596035,
          right_val: -0.4272018969058991,
          left_val: 0.1253120005130768,
        },
        {
          features: [
            [9, 7, 4, 6, -1],
            [9, 7, 2, 3, 2],
            [11, 10, 2, 3, 2],
          ],
          threshold: -0.000734250876121223,
          right_val: -0.3511157035827637,
          left_val: 0.1331433057785034,
        },
        {
          features: [
            [12, 10, 1, 6, -1],
            [12, 13, 1, 3, 2],
          ],
          threshold: -0.00014792960428167135,
          right_val: -0.3859119117259979,
          left_val: 0.1254530996084213,
        },
        {
          features: [
            [1, 2, 6, 8, -1],
            [4, 2, 3, 8, 2],
          ],
          threshold: -0.0489763393998146,
          right_val: -0.1149478033185005,
          left_val: 0.3645674884319305,
        },
        {
          features: [
            [10, 12, 1, 3, -1],
            [10, 13, 1, 1, 3],
          ],
          threshold: 0.0010917349718511105,
          right_val: -0.4139983057975769,
          left_val: 0.0790053382515907,
        },
        {
          features: [
            [5, 7, 3, 2, -1],
            [6, 7, 1, 2, 3],
          ],
          threshold: 0.005445799790322781,
          right_val: 0.3308556079864502,
          left_val: -0.1192184016108513,
        },
        {
          features: [
            [10, 13, 1, 3, -1],
            [10, 14, 1, 1, 3],
          ],
          threshold: 0.0015979419695213437,
          right_val: -0.5502822995185852,
          left_val: 0.0411811992526054,
        },
        {
          features: [
            [4, 3, 16, 9, -1],
            [4, 6, 16, 3, 3],
          ],
          threshold: -0.0013023250503465533,
          right_val: -0.3571932017803192,
          left_val: 0.0828394368290901,
        },
        {
          features: [
            [5, 12, 4, 3, -1],
            [7, 12, 2, 3, 2],
          ],
          threshold: 0.000488105695694685,
          right_val: 0.1497281044721603,
          left_val: -0.2092863023281097,
        },
        {
          features: [
            [10, 14, 1, 3, -1],
            [10, 15, 1, 1, 3],
          ],
          threshold: 0.0021033850498497486,
          right_val: -0.610999584197998,
          left_val: 0.0518394187092781,
        },
        {
          features: [
            [10, 6, 3, 8, -1],
            [11, 6, 1, 8, 3],
          ],
          threshold: 0.0119843604043126,
          right_val: -0.5898572206497192,
          left_val: 0.0410223491489887,
        },
        {
          features: [
            [1, 8, 3, 5, -1],
            [2, 8, 1, 5, 3],
          ],
          threshold: -0.0118985902518034,
          right_val: -0.0647147074341774,
          left_val: 0.4584499895572662,
        },
        {
          features: [
            [6, 7, 3, 2, -1],
            [7, 7, 1, 2, 3],
          ],
          threshold: 0.005371366161853075,
          right_val: 0.4120436906814575,
          left_val: -0.061560470610857,
        },
        {
          features: [
            [9, 10, 3, 3, -1],
            [10, 10, 1, 3, 3],
          ],
          threshold: 0.004342114087194204,
          right_val: -0.4870339035987854,
          left_val: 0.0605016611516476,
        },
        {
          features: [
            [11, 4, 4, 3, -1],
            [11, 5, 4, 1, 3],
          ],
          threshold: 0.006614251993596554,
          right_val: -0.5034617185592651,
          left_val: 0.0468731895089149,
        },
        {
          features: [
            [16, 11, 3, 1, -1],
            [17, 11, 1, 1, 3],
          ],
          threshold: 0.0012339729582890868,
          right_val: 0.3042829930782318,
          left_val: -0.0815384387969971,
        },
        {
          features: [
            [8, 0, 6, 3, -1],
            [10, 0, 2, 3, 3],
          ],
          threshold: -0.0129756601527333,
          right_val: 0.0486814901232719,
          left_val: -0.4783433079719544,
        },
        {
          features: [
            [17, 11, 2, 2, -1],
            [17, 11, 1, 1, 2],
            [18, 12, 1, 1, 2],
          ],
          threshold: -0.0017806360265240073,
          right_val: -0.0681260377168655,
          left_val: 0.3769873082637787,
        },
        {
          features: [
            [11, 3, 7, 3, -1],
            [11, 4, 7, 1, 3],
          ],
          threshold: 0.007833974435925484,
          right_val: -0.4673858880996704,
          left_val: 0.0545012801885605,
        },
        {
          features: [
            [6, 11, 1, 3, -1],
            [6, 12, 1, 1, 3],
          ],
          threshold: -0.006011370103806257,
          right_val: -0.0444346405565739,
          left_val: 0.5487005114555359,
        },
        {
          features: [
            [7, 4, 3, 2, -1],
            [8, 4, 1, 2, 3],
          ],
          threshold: -0.002069456037133932,
          right_val: 0.064383402466774,
          left_val: -0.3775554895401001,
        },
        {
          features: [
            [7, 3, 3, 3, -1],
            [8, 3, 1, 3, 3],
          ],
          threshold: 0.004784359131008387,
          right_val: -0.5263398289680481,
          left_val: 0.0462521500885487,
        },
        {
          features: [
            [6, 12, 2, 3, -1],
            [6, 13, 2, 1, 3],
          ],
          threshold: -0.006280881818383932,
          right_val: -0.0690513029694557,
          left_val: 0.3945186138153076,
        },
        {
          features: [
            [6, 12, 2, 3, -1],
            [6, 13, 2, 1, 3],
          ],
          threshold: 0.0016099009662866592,
          right_val: 0.2732166945934296,
          left_val: -0.1031619012355804,
        },
        {
          features: [
            [10, 12, 2, 3, -1],
            [10, 13, 2, 1, 3],
          ],
          threshold: -0.0008239255985245109,
          right_val: 0.0846015736460686,
          left_val: -0.2803941071033478,
        },
        {
          features: [
            [5, 0, 12, 2, -1],
            [5, 1, 12, 1, 2],
          ],
          threshold: -0.0101233199238777,
          right_val: -0.0613229498267174,
          left_val: 0.3363595008850098,
        },
        {
          features: [
            [4, 11, 8, 4, -1],
            [4, 13, 8, 2, 2],
          ],
          threshold: 0.0105257201939821,
          right_val: -0.5167213082313538,
          left_val: 0.0461656004190445,
        },
        {
          features: [
            [6, 12, 8, 4, -1],
            [6, 14, 8, 2, 2],
          ],
          threshold: -0.0267744995653629,
          right_val: 0.0398578196763992,
          left_val: -0.5032597184181213,
        },
        {
          features: [
            [4, 0, 4, 2, -1],
            [4, 0, 2, 1, 2],
            [6, 1, 2, 1, 2],
          ],
          threshold: 0.0040248301811516285,
          right_val: 0.3665980994701386,
          left_val: -0.0615013800561428,
        },
        {
          features: [
            [13, 9, 4, 2, -1],
            [13, 10, 4, 1, 2],
          ],
          threshold: -0.00046271650353446603,
          right_val: 0.0813112631440163,
          left_val: -0.2643983066082001,
        },
        {
          features: [
            [12, 10, 2, 2, -1],
            [13, 10, 1, 2, 2],
          ],
          threshold: -0.000051834900659741834,
          right_val: -0.2026937007904053,
          left_val: 0.1115439981222153,
        },
        {
          features: [
            [9, 9, 6, 1, -1],
            [12, 9, 3, 1, 2],
          ],
          threshold: 0.004887428134679794,
          right_val: 0.3361203074455261,
          left_val: -0.0696449875831604,
        },
        {
          features: [
            [6, 6, 14, 6, -1],
            [6, 9, 14, 3, 2],
          ],
          threshold: 0.1263823062181473,
          right_val: -0.6584991812705994,
          left_val: 0.0368136391043663,
        },
        {
          features: [
            [5, 10, 2, 3, -1],
            [5, 11, 2, 1, 3],
          ],
          threshold: -0.008024816401302814,
          right_val: -0.0488858595490456,
          left_val: 0.4660192131996155,
        },
        {
          features: [
            [11, 11, 1, 3, -1],
            [11, 12, 1, 1, 3],
          ],
          threshold: -0.0011518909595906734,
          right_val: 0.0585728511214256,
          left_val: -0.4046675860881805,
        },
        {
          features: [
            [5, 10, 2, 3, -1],
            [5, 11, 2, 1, 3],
          ],
          threshold: 0.0009819003753364086,
          right_val: 0.1774435043334961,
          left_val: -0.1319722980260849,
        },
        {
          features: [
            [12, 11, 6, 2, -1],
            [14, 11, 2, 2, 3],
          ],
          threshold: -0.0194479804486036,
          right_val: 0.0338345915079117,
          left_val: -0.6848952770233154,
        },
        {
          features: [
            [11, 11, 2, 1, -1],
            [12, 11, 1, 1, 2],
          ],
          threshold: -0.000007244203970913077,
          right_val: -0.1872612982988358,
          left_val: 0.1155311018228531,
        },
        {
          features: [
            [3, 11, 14, 1, -1],
            [10, 11, 7, 1, 2],
          ],
          threshold: -0.0170390605926514,
          right_val: 0.0677377134561539,
          left_val: -0.3510529100894928,
        },
        {
          features: [
            [1, 13, 6, 5, -1],
            [3, 13, 2, 5, 3],
          ],
          threshold: 0.0111865801736712,
          right_val: 0.21077099442482,
          left_val: -0.0934200435876846,
        },
        {
          features: [
            [14, 0, 2, 1, -1],
            [15, 0, 1, 1, 2],
          ],
          threshold: 0.0007658526883460581,
          right_val: -0.3212788105010986,
          left_val: 0.0659657567739487,
        },
        {
          features: [
            [10, 0, 10, 1, -1],
            [15, 0, 5, 1, 2],
          ],
          threshold: 0.00014231950626708567,
          right_val: 0.1375764012336731,
          left_val: -0.1546013057231903,
        },
        {
          features: [
            [5, 15, 3, 3, -1],
            [5, 16, 3, 1, 3],
          ],
          threshold: -0.005555320996791124,
          right_val: -0.064753532409668,
          left_val: 0.3131935000419617,
        },
        {
          features: [
            [12, 14, 2, 2, -1],
            [12, 15, 2, 1, 2],
          ],
          threshold: 0.00012308239820413291,
          right_val: -0.2225106954574585,
          left_val: 0.0976666212081909,
        },
        {
          features: [
            [12, 14, 2, 3, -1],
            [12, 15, 2, 1, 3],
          ],
          threshold: -0.0016092039877548814,
          right_val: 0.0644525587558746,
          left_val: -0.3621559143066406,
        },
        {
          features: [
            [8, 6, 1, 3, -1],
            [8, 7, 1, 1, 3],
          ],
          threshold: -0.0015626100357621908,
          right_val: -0.0955511033535004,
          left_val: 0.225887805223465,
        },
        {
          features: [
            [0, 2, 1, 3, -1],
            [0, 3, 1, 1, 3],
          ],
          threshold: -0.0005011634202674031,
          right_val: 0.0891745314002037,
          left_val: -0.2228921949863434,
        },
        {
          features: [
            [0, 2, 1, 3, -1],
            [0, 3, 1, 1, 3],
          ],
          threshold: 0.00037322030402719975,
          right_val: -0.2112991958856583,
          left_val: 0.0919690132141113,
        },
        {
          features: [
            [4, 8, 2, 2, -1],
            [4, 8, 1, 1, 2],
            [5, 9, 1, 1, 2],
          ],
          threshold: -0.002288266085088253,
          right_val: -0.0534558594226837,
          left_val: 0.3898904919624329,
        },
        {
          features: [
            [3, 6, 8, 10, -1],
            [3, 6, 4, 5, 2],
            [7, 11, 4, 5, 2],
          ],
          threshold: -0.0468840301036835,
          right_val: 0.0321945212781429,
          left_val: -0.6235709190368652,
        },
        {
          features: [
            [6, 15, 1, 3, -1],
            [6, 16, 1, 1, 3],
          ],
          threshold: 0.0018901260336861014,
          right_val: 0.2742008864879608,
          left_val: -0.0726151466369629,
        },
        {
          features: [
            [12, 0, 3, 8, -1],
            [13, 0, 1, 8, 3],
          ],
          threshold: 0.0158053301274776,
          right_val: -0.6960816979408264,
          left_val: 0.0286018308252096,
        },
        {
          features: [
            [10, 0, 10, 6, -1],
            [10, 0, 5, 3, 2],
            [15, 3, 5, 3, 2],
          ],
          threshold: 0.0326441787183285,
          right_val: 0.5087339878082275,
          left_val: -0.0407722517848015,
        },
        {
          features: [
            [17, 2, 2, 2, -1],
            [17, 3, 2, 1, 2],
          ],
          threshold: 0.000654828327242285,
          right_val: -0.2758063077926636,
          left_val: 0.085724912583828,
        },
        {
          features: [
            [8, 0, 12, 14, -1],
            [14, 0, 6, 14, 2],
          ],
          threshold: -0.0111429300159216,
          right_val: -0.2091481983661652,
          left_val: 0.0873260125517845,
        },
        {
          features: [
            [10, 18, 2, 1, -1],
            [11, 18, 1, 1, 2],
          ],
          threshold: -0.0005807222914882004,
          right_val: 0.0663378909230232,
          left_val: -0.2947142124176025,
        },
        {
          features: [
            [18, 9, 2, 6, -1],
            [18, 9, 1, 3, 2],
            [19, 12, 1, 3, 2],
          ],
          threshold: -0.000744145771022886,
          right_val: -0.1065462976694107,
          left_val: 0.1801795959472656,
        },
        {
          features: [
            [18, 4, 2, 16, -1],
            [18, 4, 1, 8, 2],
            [19, 12, 1, 8, 2],
          ],
          threshold: 0.007646066136658192,
          right_val: 0.3158234059810638,
          left_val: -0.0636081472039223,
        },
        {
          features: [
            [5, 8, 6, 6, -1],
            [8, 8, 3, 6, 2],
          ],
          threshold: 0.0326172113418579,
          right_val: -0.6054118871688843,
          left_val: 0.0326064415276051,
        },
        {
          features: [
            [6, 5, 4, 11, -1],
            [8, 5, 2, 11, 2],
          ],
          threshold: -0.0345272310078144,
          right_val: 0.0278887692838907,
          left_val: -0.5977085828781128,
        },
        {
          features: [
            [6, 8, 2, 2, -1],
            [7, 8, 1, 2, 2],
          ],
          threshold: 0.003221171908080578,
          right_val: 0.4030562043190002,
          left_val: -0.0491839200258255,
        },
        {
          features: [
            [6, 5, 2, 5, -1],
            [7, 5, 1, 5, 2],
          ],
          threshold: -0.00041549839079380035,
          right_val: -0.1584533005952835,
          left_val: 0.1353314071893692,
        },
        {
          features: [
            [10, 16, 3, 4, -1],
            [11, 16, 1, 4, 3],
          ],
          threshold: 0.0025140501093119383,
          right_val: -0.3076852858066559,
          left_val: 0.0632185712456703,
        },
        {
          features: [
            [3, 0, 8, 18, -1],
            [3, 9, 8, 9, 2],
          ],
          threshold: -0.2081820964813232,
          right_val: 0.0226959604769945,
          left_val: -0.7575026154518127,
        },
        {
          features: [
            [1, 7, 7, 3, -1],
            [1, 8, 7, 1, 3],
          ],
          threshold: -0.026067279279232,
          right_val: 0.0193754807114601,
          left_val: -0.7495995759963989,
        },
        {
          features: [
            [5, 5, 2, 6, -1],
            [5, 7, 2, 2, 3],
          ],
          threshold: -0.0005826402921229601,
          right_val: -0.1991982012987137,
          left_val: 0.0946582332253456,
        },
        {
          features: [
            [3, 8, 3, 10, -1],
            [4, 8, 1, 10, 3],
          ],
          threshold: -0.0032769259996712208,
          right_val: -0.1232203021645546,
          left_val: 0.1621433049440384,
        },
        {
          features: [
            [3, 12, 3, 2, -1],
            [4, 12, 1, 2, 3],
          ],
          threshold: 0.001399882952682674,
          right_val: 0.2315165996551514,
          left_val: -0.1084920018911362,
        },
        {
          features: [
            [3, 9, 10, 3, -1],
            [8, 9, 5, 3, 2],
          ],
          threshold: -0.0120559800416231,
          right_val: 0.0932729616761208,
          left_val: -0.2400285005569458,
        },
        {
          features: [
            [6, 15, 6, 2, -1],
            [8, 15, 2, 2, 3],
          ],
          threshold: 0.0031805539038032293,
          right_val: -0.2543506920337677,
          left_val: 0.0762641206383705,
        },
        {
          features: [
            [5, 9, 3, 2, -1],
            [6, 9, 1, 2, 3],
          ],
          threshold: -0.0010693799704313278,
          right_val: -0.0907302424311638,
          left_val: 0.2225888967514038,
        },
        {
          features: [
            [17, 5, 3, 3, -1],
            [17, 6, 3, 1, 3],
          ],
          threshold: -0.0029467688873410225,
          right_val: 0.0605810396373272,
          left_val: -0.342426985502243,
        },
        {
          features: [
            [8, 6, 1, 3, -1],
            [8, 7, 1, 1, 3],
          ],
          threshold: 0.0008810890140011907,
          right_val: 0.2691198885440826,
          left_val: -0.0783262029290199,
        },
        {
          features: [
            [18, 5, 1, 3, -1],
            [18, 6, 1, 1, 3],
          ],
          threshold: 0.0002811893937177956,
          right_val: -0.2194790989160538,
          left_val: 0.0983708277344704,
        },
        {
          features: [
            [5, 2, 5, 6, -1],
            [5, 5, 5, 3, 2],
          ],
          threshold: -0.0185748692601919,
          right_val: -0.0712407529354095,
          left_val: 0.2672972083091736,
        },
        {
          features: [
            [11, 1, 6, 3, -1],
            [13, 1, 2, 3, 3],
          ],
          threshold: -0.0248103495687246,
          right_val: 0.0294463094323874,
          left_val: -0.6832203269004822,
        },
        {
          features: [
            [6, 7, 2, 10, -1],
            [6, 12, 2, 5, 2],
          ],
          threshold: 0.0028904930222779512,
          right_val: -0.2402520030736923,
          left_val: 0.0761610120534897,
        },
        {
          features: [
            [3, 14, 4, 4, -1],
            [5, 14, 2, 4, 2],
          ],
          threshold: 0.0035410430282354355,
          right_val: 0.1850941926240921,
          left_val: -0.1074208989739418,
        },
        {
          features: [
            [2, 11, 4, 1, -1],
            [4, 11, 2, 1, 2],
          ],
          threshold: -0.0008424447732977569,
          right_val: -0.11407770216465,
          left_val: 0.1872722953557968,
        },
        {
          features: [
            [6, 4, 3, 2, -1],
            [7, 4, 1, 2, 3],
          ],
          threshold: -0.002533836057409644,
          right_val: 0.0512516610324383,
          left_val: -0.3587019145488739,
        },
        {
          features: [
            [8, 3, 2, 6, -1],
            [8, 5, 2, 2, 3],
          ],
          threshold: 0.001965498086065054,
          right_val: 0.1304101943969727,
          left_val: -0.1406472027301788,
        },
        {
          features: [
            [0, 10, 20, 10, -1],
            [10, 10, 10, 10, 2],
          ],
          threshold: 0.3157410025596619,
          right_val: -0.6315789222717285,
          left_val: 0.0295509696006775,
        },
        {
          features: [
            [13, 7, 2, 2, -1],
            [13, 8, 2, 1, 2],
          ],
          threshold: -0.0002984663879033178,
          right_val: 0.0788754224777222,
          left_val: -0.2291108071804047,
        },
        {
          features: [
            [10, 8, 10, 4, -1],
            [15, 8, 5, 4, 2],
          ],
          threshold: -0.11545480042696,
          right_val: 0.0222614500671625,
          left_val: -0.8189594149589539,
        },
        {
          features: [
            [0, 10, 16, 2, -1],
            [8, 10, 8, 2, 2],
          ],
          threshold: -0.0358172990381718,
          right_val: 0.0606441907584667,
          left_val: -0.3061293959617615,
        },
        {
          features: [
            [10, 14, 6, 6, -1],
            [10, 14, 3, 3, 2],
            [13, 17, 3, 3, 2],
          ],
          threshold: 0.0170716904103756,
          right_val: 0.3215267956256867,
          left_val: -0.0611348412930965,
        },
        {
          features: [
            [13, 10, 1, 3, -1],
            [13, 11, 1, 1, 3],
          ],
          threshold: -0.002138508018106222,
          right_val: 0.038667369633913,
          left_val: -0.5479816198348999,
        },
        {
          features: [
            [4, 4, 10, 8, -1],
            [4, 4, 5, 4, 2],
            [9, 8, 5, 4, 2],
          ],
          threshold: 0.065424457192421,
          right_val: -0.8562883138656616,
          left_val: 0.0178842600435019,
        },
        {
          features: [
            [5, 1, 6, 6, -1],
            [5, 1, 3, 3, 2],
            [8, 4, 3, 3, 2],
          ],
          threshold: -0.0134199298918247,
          right_val: -0.0675596669316292,
          left_val: 0.3099510073661804,
        },
        {
          features: [
            [11, 10, 8, 3, -1],
            [11, 11, 8, 1, 3],
          ],
          threshold: 0.0189397092908621,
          right_val: -0.7533819079399109,
          left_val: 0.0287297293543816,
        },
        {
          features: [
            [3, 11, 3, 6, -1],
            [3, 13, 3, 2, 3],
          ],
          threshold: -0.029120460152626,
          right_val: 0.0203595496714115,
          left_val: -0.7359461784362793,
        },
      ],
      threshold: -1.656304955482483,
    },
    {
      simpleClassifiers: [
        {
          features: [
            [8, 0, 12, 6, -1],
            [8, 0, 6, 3, 2],
            [14, 3, 6, 3, 2],
          ],
          threshold: -0.0134190302342176,
          right_val: -0.4178233146667481,
          left_val: 0.30538010597229,
        },
        {
          features: [
            [7, 8, 2, 4, -1],
            [7, 8, 1, 2, 2],
            [8, 10, 1, 2, 2],
          ],
          threshold: 0.0017404999816790223,
          right_val: 0.3540956079959869,
          left_val: -0.2710157930850983,
        },
        {
          features: [
            [11, 1, 7, 10, -1],
            [11, 6, 7, 5, 2],
          ],
          threshold: 0.007717486005276442,
          right_val: 0.2118998020887375,
          left_val: -0.3127137124538422,
        },
        {
          features: [
            [10, 15, 3, 2, -1],
            [10, 16, 3, 1, 2],
          ],
          threshold: -0.000014514879694615956,
          right_val: -0.3352273106575012,
          left_val: 0.1615709066390991,
        },
        {
          features: [
            [11, 11, 2, 3, -1],
            [12, 11, 1, 3, 2],
          ],
          threshold: -0.000014871519852022175,
          right_val: -0.2936952114105225,
          left_val: 0.145716205239296,
        },
        {
          features: [
            [6, 8, 3, 2, -1],
            [6, 9, 3, 1, 2],
          ],
          threshold: 0.00015004149463493377,
          right_val: 0.1040794998407364,
          left_val: -0.4014987945556641,
        },
        {
          features: [
            [11, 14, 1, 3, -1],
            [11, 15, 1, 1, 3],
          ],
          threshold: 0.001863487996160984,
          right_val: -0.6520826816558838,
          left_val: 0.0490628406405449,
        },
        {
          features: [
            [5, 11, 2, 3, -1],
            [5, 12, 2, 1, 3],
          ],
          threshold: -0.0029590800404548645,
          right_val: -0.1329340934753418,
          left_val: 0.2880443036556244,
        },
        {
          features: [
            [12, 12, 2, 2, -1],
            [12, 13, 2, 1, 2],
          ],
          threshold: 0.0003306778089608997,
          right_val: -0.4154086112976074,
          left_val: 0.0396153703331947,
        },
        {
          features: [
            [11, 3, 8, 9, -1],
            [11, 6, 8, 3, 3],
          ],
          threshold: -0.0016816710121929646,
          right_val: -0.2323751002550125,
          left_val: 0.1303257942199707,
        },
        {
          features: [
            [10, 11, 3, 3, -1],
            [11, 11, 1, 3, 3],
          ],
          threshold: 0.0034896740689873695,
          right_val: -0.471760094165802,
          left_val: 0.0688529163599014,
        },
        {
          features: [
            [6, 11, 1, 3, -1],
            [6, 12, 1, 1, 3],
          ],
          threshold: 0.0016204500570893288,
          right_val: 0.3488718867301941,
          left_val: -0.1099696010351181,
        },
        {
          features: [
            [9, 6, 2, 3, -1],
            [10, 6, 1, 3, 2],
          ],
          threshold: 0.00019125849939882755,
          right_val: 0.1477562040090561,
          left_val: -0.2031732052564621,
        },
        {
          features: [
            [7, 8, 2, 6, -1],
            [7, 10, 2, 2, 3],
          ],
          threshold: 0.0224852599203587,
          right_val: -0.5481569170951843,
          left_val: 0.0519297309219837,
        },
        {
          features: [
            [3, 0, 4, 6, -1],
            [3, 0, 2, 3, 2],
            [5, 3, 2, 3, 2],
          ],
          threshold: 0.0100359497591853,
          right_val: 0.2600057125091553,
          left_val: -0.1094331964850426,
        },
        {
          features: [
            [5, 0, 3, 17, -1],
            [6, 0, 1, 17, 3],
          ],
          threshold: 0.0400916300714016,
          right_val: -0.7472460269927979,
          left_val: 0.0386570505797863,
        },
        {
          features: [
            [12, 9, 6, 3, -1],
            [12, 10, 6, 1, 3],
          ],
          threshold: 0.0153190195560455,
          right_val: -0.7771779894828796,
          left_val: 0.028579369187355,
        },
        {
          features: [
            [10, 19, 8, 1, -1],
            [14, 19, 4, 1, 2],
          ],
          threshold: 0.000909134279936552,
          right_val: 0.173633798956871,
          left_val: -0.1504954993724823,
        },
        {
          features: [
            [13, 3, 5, 3, -1],
            [13, 4, 5, 1, 3],
          ],
          threshold: -0.00602261908352375,
          right_val: 0.0581856705248356,
          left_val: -0.4770449101924896,
        },
        {
          features: [
            [5, 7, 2, 2, -1],
            [6, 7, 1, 2, 2],
          ],
          threshold: 0.0007806678768247366,
          right_val: 0.1623692065477371,
          left_val: -0.1634933948516846,
        },
        {
          features: [
            [12, 10, 3, 10, -1],
            [13, 10, 1, 10, 3],
          ],
          threshold: -0.0114920204505324,
          right_val: 0.046009611338377,
          left_val: -0.5618547797203064,
        },
        {
          features: [
            [4, 7, 6, 3, -1],
            [7, 7, 3, 3, 2],
          ],
          threshold: 0.008969132788479328,
          right_val: -0.3382484018802643,
          left_val: 0.066570483148098,
        },
        {
          features: [
            [6, 10, 1, 3, -1],
            [6, 11, 1, 1, 3],
          ],
          threshold: 0.0007224194123409688,
          right_val: 0.1900296956300736,
          left_val: -0.1288266927003861,
        },
        {
          features: [
            [6, 9, 2, 3, -1],
            [6, 10, 2, 1, 3],
          ],
          threshold: 0.000014879239643050823,
          right_val: 0.1315100938081741,
          left_val: -0.2176592946052551,
        },
        {
          features: [
            [11, 3, 6, 3, -1],
            [11, 4, 6, 1, 3],
          ],
          threshold: 0.008715973235666752,
          right_val: -0.5236771702766418,
          left_val: 0.0481882393360138,
        },
        {
          features: [
            [13, 14, 2, 3, -1],
            [13, 15, 2, 1, 3],
          ],
          threshold: -0.0013809900265187025,
          right_val: 0.0670123621821404,
          left_val: -0.3173463046550751,
        },
        {
          features: [
            [6, 16, 8, 4, -1],
            [6, 16, 4, 2, 2],
            [10, 18, 4, 2, 2],
          ],
          threshold: 0.0140041103586555,
          right_val: 0.3490039110183716,
          left_val: -0.0721551775932312,
        },
        {
          features: [
            [10, 5, 3, 15, -1],
            [11, 5, 1, 15, 3],
          ],
          threshold: -0.012883460149169,
          right_val: 0.0392199903726578,
          left_val: -0.5967429876327515,
        },
        {
          features: [
            [10, 0, 10, 6, -1],
            [10, 0, 5, 3, 2],
            [15, 3, 5, 3, 2],
          ],
          threshold: 0.009922076016664505,
          right_val: 0.354916512966156,
          left_val: -0.073617048561573,
        },
        {
          features: [
            [11, 2, 3, 16, -1],
            [12, 2, 1, 16, 3],
          ],
          threshold: -0.0103603601455688,
          right_val: 0.0545167215168476,
          left_val: -0.4965578019618988,
        },
        {
          features: [
            [7, 12, 2, 2, -1],
            [7, 12, 1, 1, 2],
            [8, 13, 1, 1, 2],
          ],
          threshold: 0.0005910394829697907,
          right_val: 0.237384095788002,
          left_val: -0.09164909273386,
        },
        {
          features: [
            [6, 4, 2, 1, -1],
            [7, 4, 1, 1, 2],
          ],
          threshold: 0.000014986419955675956,
          right_val: 0.1421668976545334,
          left_val: -0.1562436074018478,
        },
        {
          features: [
            [6, 3, 3, 4, -1],
            [7, 3, 1, 4, 3],
          ],
          threshold: 0.006252629216760397,
          right_val: -0.4386126101016998,
          left_val: 0.0465709418058395,
        },
        {
          features: [
            [0, 13, 16, 6, -1],
            [0, 15, 16, 2, 3],
          ],
          threshold: 0.0907229781150818,
          right_val: -0.7555767893791199,
          left_val: 0.0235441196709871,
        },
        {
          features: [
            [7, 14, 2, 3, -1],
            [7, 15, 2, 1, 3],
          ],
          threshold: 0.0012880839640274644,
          right_val: 0.1995418965816498,
          left_val: -0.1099981963634491,
        },
        {
          features: [
            [15, 17, 2, 2, -1],
            [15, 18, 2, 1, 2],
          ],
          threshold: -0.0005320283235050738,
          right_val: 0.0943498313426971,
          left_val: -0.2368102073669434,
        },
        {
          features: [
            [17, 12, 2, 2, -1],
            [17, 12, 1, 1, 2],
            [18, 13, 1, 1, 2],
          ],
          threshold: 0.0014669039519503713,
          right_val: 0.3543792963027954,
          left_val: -0.0604179389774799,
        },
        {
          features: [
            [11, 1, 3, 19, -1],
            [12, 1, 1, 19, 3],
          ],
          threshold: 0.0259292703121901,
          right_val: -0.7117512226104736,
          left_val: 0.0302053801715374,
        },
        {
          features: [
            [1, 11, 19, 4, -1],
            [1, 13, 19, 2, 2],
          ],
          threshold: -0.0722578391432762,
          right_val: 0.0220785401761532,
          left_val: -0.7683005928993225,
        },
        {
          features: [
            [17, 8, 2, 10, -1],
            [17, 8, 1, 5, 2],
            [18, 13, 1, 5, 2],
          ],
          threshold: -0.002599983010441065,
          right_val: -0.0925756469368935,
          left_val: 0.2287825047969818,
        },
        {
          features: [
            [9, 0, 11, 20, -1],
            [9, 10, 11, 10, 2],
          ],
          threshold: 0.4203611016273499,
          right_val: -0.6394466757774353,
          left_val: 0.0341291502118111,
        },
        {
          features: [
            [4, 1, 12, 12, -1],
            [4, 1, 6, 6, 2],
            [10, 7, 6, 6, 2],
          ],
          threshold: -0.002172203967347741,
          right_val: 0.0967273488640785,
          left_val: -0.204587996006012,
        },
        {
          features: [
            [5, 11, 3, 6, -1],
            [6, 11, 1, 6, 3],
          ],
          threshold: -0.0185732506215572,
          right_val: 0.026587400585413,
          left_val: -0.7232174277305603,
        },
        {
          features: [
            [4, 8, 3, 1, -1],
            [5, 8, 1, 1, 3],
          ],
          threshold: 0.0021321140229701996,
          right_val: 0.2900441884994507,
          left_val: -0.0792631730437279,
        },
        {
          features: [
            [18, 1, 2, 4, -1],
            [19, 1, 1, 4, 2],
          ],
          threshold: 0.000014585970347980037,
          right_val: 0.1285791993141174,
          left_val: -0.1581220030784607,
        },
        {
          features: [
            [11, 0, 8, 15, -1],
            [15, 0, 4, 15, 2],
          ],
          threshold: -0.2591994106769562,
          right_val: 0.0213276296854019,
          left_val: -0.8320639133453369,
        },
        {
          features: [
            [5, 5, 6, 2, -1],
            [7, 5, 2, 2, 3],
          ],
          threshold: -0.0127138802781701,
          right_val: 0.0352829098701477,
          left_val: -0.4867066144943237,
        },
        {
          features: [
            [17, 11, 2, 2, -1],
            [17, 11, 1, 1, 2],
            [18, 12, 1, 1, 2],
          ],
          threshold: 0.0021182969212532043,
          right_val: 0.4349882006645203,
          left_val: -0.0481418594717979,
        },
        {
          features: [
            [6, 8, 2, 8, -1],
            [6, 12, 2, 4, 2],
          ],
          threshold: 0.004922540858387947,
          right_val: -0.357199102640152,
          left_val: 0.0593890100717545,
        },
        {
          features: [
            [9, 9, 2, 4, -1],
            [9, 11, 2, 2, 2],
          ],
          threshold: 0.007172069046646357,
          right_val: 0.3171677887439728,
          left_val: -0.0727212205529213,
        },
        {
          features: [
            [0, 8, 2, 2, -1],
            [0, 9, 2, 1, 2],
          ],
          threshold: 0.001531932968646288,
          right_val: -0.2982640862464905,
          left_val: 0.0761052817106247,
        },
        {
          features: [
            [7, 12, 8, 4, -1],
            [7, 14, 8, 2, 2],
          ],
          threshold: -0.0261416807770729,
          right_val: 0.0419912002980709,
          left_val: -0.4812982976436615,
        },
        {
          features: [
            [11, 13, 3, 2, -1],
            [11, 14, 3, 1, 2],
          ],
          threshold: -0.000007186181846918771,
          right_val: -0.25540891289711,
          left_val: 0.1038590967655182,
        },
        {
          features: [
            [5, 8, 2, 2, -1],
            [5, 8, 1, 1, 2],
            [6, 9, 1, 1, 2],
          ],
          threshold: -0.0005851330934092402,
          right_val: -0.1044678017497063,
          left_val: 0.2155243009328842,
        },
        {
          features: [
            [12, 11, 2, 3, -1],
            [12, 12, 2, 1, 3],
          ],
          threshold: 0.0007356466958299279,
          right_val: -0.2322968989610672,
          left_val: 0.082850307226181,
        },
        {
          features: [
            [10, 8, 2, 2, -1],
            [10, 8, 1, 1, 2],
            [11, 9, 1, 1, 2],
          ],
          threshold: -0.0004421600024215877,
          right_val: -0.1108435988426209,
          left_val: 0.1984968930482864,
        },
        {
          features: [
            [6, 16, 3, 2, -1],
            [7, 16, 1, 2, 3],
          ],
          threshold: 0.006654500029981136,
          right_val: -0.6381940245628357,
          left_val: 0.0298448391258717,
        },
        {
          features: [
            [13, 12, 2, 1, -1],
            [14, 12, 1, 1, 2],
          ],
          threshold: -0.000014856060261081439,
          right_val: -0.1630474030971527,
          left_val: 0.1064781025052071,
        },
        {
          features: [
            [16, 9, 2, 6, -1],
            [16, 9, 1, 3, 2],
            [17, 12, 1, 3, 2],
          ],
          threshold: 0.004493334796279669,
          right_val: 0.322002112865448,
          left_val: -0.0583121813833714,
        },
        {
          features: [
            [17, 2, 2, 6, -1],
            [17, 4, 2, 2, 3],
          ],
          threshold: 0.00381109700538218,
          right_val: -0.2714948058128357,
          left_val: 0.0712374374270439,
        },
        {
          features: [
            [13, 2, 7, 6, -1],
            [13, 4, 7, 2, 3],
          ],
          threshold: -0.0383090190589428,
          right_val: 0.0297903995960951,
          left_val: -0.6238747835159302,
        },
        {
          features: [
            [16, 10, 4, 4, -1],
            [16, 10, 2, 2, 2],
            [18, 12, 2, 2, 2],
          ],
          threshold: -0.0025534629821777344,
          right_val: -0.0934725701808929,
          left_val: 0.2094762027263641,
        },
        {
          features: [
            [11, 10, 2, 2, -1],
            [11, 11, 2, 1, 2],
          ],
          threshold: -0.00002990810935443733,
          right_val: -0.1285872012376785,
          left_val: 0.1477189958095551,
        },
        {
          features: [
            [6, 13, 3, 3, -1],
            [6, 14, 3, 1, 3],
          ],
          threshold: 0.002054952085018158,
          right_val: 0.2191116958856583,
          left_val: -0.0936039835214615,
        },
        {
          features: [
            [4, 14, 4, 2, -1],
            [4, 15, 4, 1, 2],
          ],
          threshold: 0.000330648006638512,
          right_val: 0.1690506041049957,
          left_val: -0.1443066000938416,
        },
        {
          features: [
            [0, 9, 2, 1, -1],
            [1, 9, 1, 1, 2],
          ],
          threshold: 0.00040969369001686573,
          right_val: -0.2179321050643921,
          left_val: 0.0898449569940567,
        },
        {
          features: [
            [7, 6, 4, 8, -1],
            [7, 10, 4, 4, 2],
          ],
          threshold: -0.0005168038187548518,
          right_val: 0.0724907070398331,
          left_val: -0.2733086049556732,
        },
        {
          features: [
            [9, 17, 7, 3, -1],
            [9, 18, 7, 1, 3],
          ],
          threshold: -0.0122852995991707,
          right_val: 0.0288281291723251,
          left_val: -0.5789995193481445,
        },
        {
          features: [
            [7, 12, 2, 3, -1],
            [7, 13, 2, 1, 3],
          ],
          threshold: 0.0014923219569027424,
          right_val: 0.2131579071283341,
          left_val: -0.089748427271843,
        },
        {
          features: [
            [12, 17, 4, 3, -1],
            [12, 18, 4, 1, 3],
          ],
          threshold: 0.003780957078561187,
          right_val: -0.3258047997951508,
          left_val: 0.0568691305816174,
        },
        {
          features: [
            [11, 7, 9, 11, -1],
            [14, 7, 3, 11, 3],
          ],
          threshold: -0.1363079994916916,
          right_val: 0.0340148694813252,
          left_val: -0.5195829272270203,
        },
        {
          features: [
            [16, 14, 4, 5, -1],
            [18, 14, 2, 5, 2],
          ],
          threshold: 0.0211922507733107,
          right_val: 0.4313400089740753,
          left_val: -0.0598157495260239,
        },
        {
          features: [
            [9, 2, 3, 4, -1],
            [10, 2, 1, 4, 3],
          ],
          threshold: -0.0022501780185848475,
          right_val: 0.0694940388202667,
          left_val: -0.3272511065006256,
        },
        {
          features: [
            [3, 11, 2, 8, -1],
            [3, 11, 1, 4, 2],
            [4, 15, 1, 4, 2],
          ],
          threshold: -0.0133094396442175,
          right_val: -0.0380551107227802,
          left_val: 0.5568472146987915,
        },
        {
          features: [
            [13, 2, 6, 18, -1],
            [13, 2, 3, 9, 2],
            [16, 11, 3, 9, 2],
          ],
          threshold: -0.048674400895834,
          right_val: -0.0480452999472618,
          left_val: 0.3750388920307159,
        },
        {
          features: [
            [9, 12, 5, 2, -1],
            [9, 13, 5, 1, 2],
          ],
          threshold: -0.000014651560377387796,
          right_val: -0.2298455983400345,
          left_val: 0.0930435433983803,
        },
        {
          features: [
            [11, 8, 4, 10, -1],
            [11, 8, 2, 5, 2],
            [13, 13, 2, 5, 2],
          ],
          threshold: -0.00776056619361043,
          right_val: -0.0546693094074726,
          left_val: 0.3885821104049683,
        },
        {
          features: [
            [0, 11, 20, 1, -1],
            [10, 11, 10, 1, 2],
          ],
          threshold: 0.0244293306022882,
          right_val: -0.5106111168861389,
          left_val: 0.045898649841547,
        },
        {
          features: [
            [1, 12, 1, 2, -1],
            [1, 13, 1, 1, 2],
          ],
          threshold: -0.00021317049686331302,
          right_val: 0.1050731018185616,
          left_val: -0.2051361054182053,
        },
      ],
      threshold: -1.5920439958572388,
    },
    {
      simpleClassifiers: [
        {
          features: [
            [6, 7, 6, 3, -1],
            [8, 7, 2, 3, 3],
          ],
          threshold: -0.005701429210603237,
          right_val: -0.3312371969223023,
          left_val: 0.2757621109485626,
        },
        {
          features: [
            [8, 5, 10, 3, -1],
            [13, 5, 5, 3, 2],
          ],
          threshold: -0.0044359369203448296,
          right_val: -0.502886176109314,
          left_val: 0.1558748036623001,
        },
        {
          features: [
            [5, 5, 4, 6, -1],
            [5, 7, 4, 2, 3],
          ],
          threshold: -0.005038825795054436,
          right_val: -0.351960688829422,
          left_val: 0.1610901057720184,
        },
        {
          features: [
            [5, 11, 6, 3, -1],
            [8, 11, 3, 3, 2],
          ],
          threshold: 0.0008084743749350309,
          right_val: 0.1444645971059799,
          left_val: -0.3331570029258728,
        },
        {
          features: [
            [2, 8, 3, 7, -1],
            [3, 8, 1, 7, 3],
          ],
          threshold: 0.0216053295880556,
          right_val: 0.5910193920135498,
          left_val: -0.0867235735058784,
        },
        {
          features: [
            [2, 10, 3, 6, -1],
            [3, 10, 1, 6, 3],
          ],
          threshold: -0.0182668399065733,
          right_val: -0.084620863199234,
          left_val: 0.5026186108589172,
        },
        {
          features: [
            [14, 0, 2, 2, -1],
            [15, 0, 1, 2, 2],
          ],
          threshold: -0.000833846686873585,
          right_val: 0.1135276034474373,
          left_val: -0.3083251118659973,
        },
        {
          features: [
            [8, 7, 4, 4, -1],
            [8, 7, 2, 2, 2],
            [10, 9, 2, 2, 2],
          ],
          threshold: -0.0153366001322865,
          right_val: 0.03305783867836,
          left_val: -0.6861060857772827,
        },
        {
          features: [
            [4, 13, 4, 3, -1],
            [4, 14, 4, 1, 3],
          ],
          threshold: -0.005060787778347731,
          right_val: -0.0921182334423065,
          left_val: 0.3439927995204926,
        },
        {
          features: [
            [8, 11, 6, 2, -1],
            [8, 12, 6, 1, 2],
          ],
          threshold: -0.00001474170039728051,
          right_val: -0.2523517906665802,
          left_val: 0.1177816987037659,
        },
        {
          features: [
            [17, 3, 1, 4, -1],
            [17, 5, 1, 2, 2],
          ],
          threshold: -0.001148573006503284,
          right_val: 0.0835330486297607,
          left_val: -0.2905001938343048,
        },
        {
          features: [
            [6, 13, 2, 3, -1],
            [6, 14, 2, 1, 3],
          ],
          threshold: 0.0028824089094996452,
          right_val: 0.3127414882183075,
          left_val: -0.0906742364168167,
        },
        {
          features: [
            [7, 9, 6, 8, -1],
            [7, 9, 3, 4, 2],
            [10, 13, 3, 4, 2],
          ],
          threshold: -0.0292243603616953,
          right_val: 0.0332797802984715,
          left_val: -0.6915637850761414,
        },
        {
          features: [
            [5, 15, 2, 3, -1],
            [5, 16, 2, 1, 3],
          ],
          threshold: 0.0021423520520329475,
          right_val: 0.2460308969020844,
          left_val: -0.1008772999048233,
        },
        {
          features: [
            [7, 10, 4, 9, -1],
            [7, 13, 4, 3, 3],
          ],
          threshold: -0.0334710590541363,
          right_val: 0.0550520718097687,
          left_val: -0.5095394253730774,
        },
        {
          features: [
            [5, 4, 2, 1, -1],
            [6, 4, 1, 1, 2],
          ],
          threshold: 0.000014763450053578708,
          right_val: 0.1281639933586121,
          left_val: -0.178231492638588,
        },
        {
          features: [
            [0, 1, 6, 19, -1],
            [2, 1, 2, 19, 3],
          ],
          threshold: 0.0163415595889091,
          right_val: 0.1966349929571152,
          left_val: -0.1325473934412003,
        },
        {
          features: [
            [5, 8, 6, 2, -1],
            [8, 8, 3, 2, 2],
          ],
          threshold: 0.0022475779987871647,
          right_val: -0.2947632074356079,
          left_val: 0.0790484473109245,
        },
        {
          features: [
            [5, 11, 3, 3, -1],
            [5, 12, 3, 1, 3],
          ],
          threshold: 0.0046113221906125546,
          right_val: 0.323944091796875,
          left_val: -0.0763384476304054,
        },
        {
          features: [
            [5, 10, 2, 3, -1],
            [5, 11, 2, 1, 3],
          ],
          threshold: 0.002897907979786396,
          right_val: 0.263533890247345,
          left_val: -0.1083905026316643,
        },
        {
          features: [
            [9, 12, 2, 4, -1],
            [9, 12, 1, 2, 2],
            [10, 14, 1, 2, 2],
          ],
          threshold: 0.001348281977698207,
          right_val: -0.3483985960483551,
          left_val: 0.0791345611214638,
        },
        {
          features: [
            [12, 7, 2, 10, -1],
            [12, 12, 2, 5, 2],
          ],
          threshold: 0.004657659213989973,
          right_val: -0.3111054003238678,
          left_val: 0.0763560906052589,
        },
        {
          features: [
            [10, 6, 6, 8, -1],
            [10, 10, 6, 4, 2],
          ],
          threshold: -0.003991509787738323,
          right_val: 0.0826234668493271,
          left_val: -0.3415162861347199,
        },
        {
          features: [
            [4, 3, 2, 6, -1],
            [5, 3, 1, 6, 2],
          ],
          threshold: 0.006026879884302616,
          right_val: 0.2634766101837158,
          left_val: -0.0962778329849243,
        },
        {
          features: [
            [4, 6, 3, 3, -1],
            [5, 6, 1, 3, 3],
          ],
          threshold: -0.0041388701647520065,
          right_val: -0.0943352878093719,
          left_val: 0.2357172966003418,
        },
        {
          features: [
            [10, 7, 2, 8, -1],
            [10, 7, 1, 4, 2],
            [11, 11, 1, 4, 2],
          ],
          threshold: -0.0103717502206564,
          right_val: 0.0336452201008797,
          left_val: -0.7297279834747314,
        },
        {
          features: [
            [2, 0, 6, 10, -1],
            [2, 5, 6, 5, 2],
          ],
          threshold: 0.1037362962961197,
          right_val: -0.5824512839317322,
          left_val: 0.031347069889307,
        },
        {
          features: [
            [8, 10, 6, 2, -1],
            [8, 11, 6, 1, 2],
          ],
          threshold: -0.00018832299974747002,
          right_val: -0.1372316032648087,
          left_val: 0.1666329950094223,
        },
        {
          features: [
            [10, 0, 2, 1, -1],
            [11, 0, 1, 1, 2],
          ],
          threshold: -0.0006074992124922574,
          right_val: 0.0814833715558052,
          left_val: -0.2725754082202911,
        },
        {
          features: [
            [4, 16, 4, 3, -1],
            [4, 17, 4, 1, 3],
          ],
          threshold: 0.0023499270901083946,
          right_val: 0.2185488939285278,
          left_val: -0.1028544008731842,
        },
        {
          features: [
            [7, 4, 3, 2, -1],
            [8, 4, 1, 2, 3],
          ],
          threshold: -0.0031354159582406282,
          right_val: 0.0447473600506783,
          left_val: -0.4924603998661041,
        },
        {
          features: [
            [7, 5, 3, 1, -1],
            [8, 5, 1, 1, 3],
          ],
          threshold: 0.001556458999402821,
          right_val: -0.4052621126174927,
          left_val: 0.0530962608754635,
        },
        {
          features: [
            [5, 5, 6, 3, -1],
            [5, 6, 6, 1, 3],
          ],
          threshold: 0.006323609966784716,
          right_val: 0.2841371893882752,
          left_val: -0.0791168063879013,
        },
        {
          features: [
            [5, 5, 5, 3, -1],
            [5, 6, 5, 1, 3],
          ],
          threshold: -0.004807405173778534,
          right_val: -0.0828240811824799,
          left_val: 0.2999025881290436,
        },
        {
          features: [
            [10, 7, 6, 9, -1],
            [10, 10, 6, 3, 3],
          ],
          threshold: 0.0764323025941849,
          right_val: -0.5731434226036072,
          left_val: 0.0391463711857796,
        },
        {
          features: [
            [17, 4, 1, 2, -1],
            [17, 5, 1, 1, 2],
          ],
          threshold: 0.0007024995284155011,
          right_val: -0.3324547111988068,
          left_val: 0.0528328716754913,
        },
        {
          features: [
            [4, 9, 10, 4, -1],
            [4, 9, 5, 2, 2],
            [9, 11, 5, 2, 2],
          ],
          threshold: -0.0008215713896788657,
          right_val: 0.0881458297371864,
          left_val: -0.2123001962900162,
        },
        {
          features: [
            [5, 6, 3, 10, -1],
            [5, 11, 3, 5, 2],
          ],
          threshold: -0.0101482803002,
          right_val: 0.0965974032878876,
          left_val: -0.2207161039113998,
        },
        {
          features: [
            [2, 13, 18, 5, -1],
            [11, 13, 9, 5, 2],
          ],
          threshold: -0.1734880954027176,
          right_val: 0.0325470604002476,
          left_val: -0.598222017288208,
        },
        {
          features: [
            [5, 12, 3, 3, -1],
            [5, 13, 3, 1, 3],
          ],
          threshold: 0.004303154069930315,
          right_val: 0.2898102998733521,
          left_val: -0.0682535469532013,
        },
        {
          features: [
            [9, 12, 2, 4, -1],
            [9, 14, 2, 2, 2],
          ],
          threshold: -0.000007337867828027811,
          right_val: -0.2586359083652496,
          left_val: 0.0751555636525154,
        },
        {
          features: [
            [5, 11, 15, 6, -1],
            [5, 13, 15, 2, 3],
          ],
          threshold: 0.0019277239916846156,
          right_val: -0.1659514009952545,
          left_val: 0.1085646003484726,
        },
        {
          features: [
            [16, 0, 4, 6, -1],
            [16, 0, 2, 3, 2],
            [18, 3, 2, 3, 2],
          ],
          threshold: -0.0042054480873048306,
          right_val: -0.0919417068362236,
          left_val: 0.1981130987405777,
        },
        {
          features: [
            [11, 12, 2, 2, -1],
            [11, 12, 1, 1, 2],
            [12, 13, 1, 1, 2],
          ],
          threshold: 0.0011466189753264189,
          right_val: -0.4399102926254273,
          left_val: 0.0420787297189236,
        },
        {
          features: [
            [6, 6, 3, 5, -1],
            [7, 6, 1, 5, 3],
          ],
          threshold: -0.0067244949750602245,
          right_val: -0.0570969581604004,
          left_val: 0.3445686101913452,
        },
        {
          features: [
            [13, 13, 2, 1, -1],
            [14, 13, 1, 1, 2],
          ],
          threshold: -0.000014554189874615986,
          right_val: -0.1625221073627472,
          left_val: 0.1163256019353867,
        },
        {
          features: [
            [5, 8, 3, 2, -1],
            [6, 8, 1, 2, 3],
          ],
          threshold: -0.002611455973237753,
          right_val: -0.0682430416345596,
          left_val: 0.2808496952056885,
        },
        {
          features: [
            [0, 0, 2, 1, -1],
            [1, 0, 1, 1, 2],
          ],
          threshold: -0.0001947746059158817,
          right_val: 0.0934132263064384,
          left_val: -0.1936886012554169,
        },
        {
          features: [
            [0, 0, 2, 1, -1],
            [1, 0, 1, 1, 2],
          ],
          threshold: 0.00026438338682055473,
          right_val: -0.2158662974834442,
          left_val: 0.0993543714284897,
        },
        {
          features: [
            [16, 12, 3, 1, -1],
            [17, 12, 1, 1, 3],
          ],
          threshold: 0.002013471908867359,
          right_val: 0.2912097871303558,
          left_val: -0.0612092018127441,
        },
        {
          features: [
            [8, 5, 12, 8, -1],
            [14, 5, 6, 8, 2],
          ],
          threshold: -0.2602435946464539,
          right_val: 0.0211507603526115,
          left_val: -0.8380218148231506,
        },
        {
          features: [
            [5, 13, 4, 4, -1],
            [5, 13, 2, 2, 2],
            [7, 15, 2, 2, 2],
          ],
          threshold: -0.0159447006881237,
          right_val: 0.0221448391675949,
          left_val: -0.6397479772567749,
        },
        {
          features: [
            [5, 7, 2, 3, -1],
            [6, 7, 1, 3, 2],
          ],
          threshold: 0.0006724988925270736,
          right_val: 0.1232635006308556,
          left_val: -0.1401409059762955,
        },
        {
          features: [
            [9, 2, 2, 10, -1],
            [9, 2, 1, 5, 2],
            [10, 7, 1, 5, 2],
          ],
          threshold: 0.0130427703261375,
          right_val: -0.6630306839942932,
          left_val: 0.0243068896234035,
        },
        {
          features: [
            [9, 14, 1, 2, -1],
            [9, 15, 1, 1, 2],
          ],
          threshold: -0.00001454029006708879,
          right_val: -0.1740916967391968,
          left_val: 0.0901373624801636,
        },
        {
          features: [
            [15, 7, 2, 4, -1],
            [15, 9, 2, 2, 2],
          ],
          threshold: 0.0179208293557167,
          right_val: -0.6506714224815369,
          left_val: 0.0256446208804846,
        },
        {
          features: [
            [7, 5, 4, 3, -1],
            [7, 6, 4, 1, 3],
          ],
          threshold: 0.0016542300581932068,
          right_val: 0.1668816059827805,
          left_val: -0.1038570031523705,
        },
        {
          features: [
            [3, 10, 8, 2, -1],
            [7, 10, 4, 2, 2],
          ],
          threshold: 0.0353620909154415,
          right_val: -0.6900941729545593,
          left_val: 0.0230930093675852,
        },
        {
          features: [
            [13, 8, 2, 2, -1],
            [13, 9, 2, 1, 2],
          ],
          threshold: 0.00003304984056740068,
          right_val: 0.0938730984926224,
          left_val: -0.1740894019603729,
        },
        {
          features: [
            [9, 6, 2, 3, -1],
            [9, 7, 2, 1, 3],
          ],
          threshold: 0.003377558896318078,
          right_val: 0.3049055933952332,
          left_val: -0.0585224591195583,
        },
        {
          features: [
            [13, 10, 5, 2, -1],
            [13, 11, 5, 1, 2],
          ],
          threshold: 0.007323973812162876,
          right_val: -0.461609810590744,
          left_val: 0.0409994088113308,
        },
        {
          features: [
            [16, 11, 2, 2, -1],
            [16, 11, 1, 1, 2],
            [17, 12, 1, 1, 2],
          ],
          threshold: -0.002979705110192299,
          right_val: -0.036246869713068,
          left_val: 0.5113676190376282,
        },
        {
          features: [
            [0, 10, 2, 4, -1],
            [0, 10, 1, 2, 2],
            [1, 12, 1, 2, 2],
          ],
          threshold: 0.002030649920925498,
          right_val: -0.2669849991798401,
          left_val: 0.0653093531727791,
        },
        {
          features: [
            [0, 8, 2, 8, -1],
            [0, 8, 1, 4, 2],
            [1, 12, 1, 4, 2],
          ],
          threshold: -0.0006885695038363338,
          right_val: 0.0993618965148926,
          left_val: -0.1760412007570267,
        },
        {
          features: [
            [6, 14, 5, 3, -1],
            [6, 15, 5, 1, 3],
          ],
          threshold: 0.0015746579738333821,
          right_val: 0.1694055050611496,
          left_val: -0.1031226962804794,
        },
        {
          features: [
            [18, 8, 2, 4, -1],
            [19, 8, 1, 4, 2],
          ],
          threshold: 0.0015011089853942394,
          right_val: 0.188990905880928,
          left_val: -0.0881284475326538,
        },
        {
          features: [
            [14, 2, 3, 1, -1],
            [15, 2, 1, 1, 3],
          ],
          threshold: 0.00013503979425877333,
          right_val: -0.1848344057798386,
          left_val: 0.0941454768180847,
        },
        {
          features: [
            [9, 13, 3, 3, -1],
            [9, 14, 3, 1, 3],
          ],
          threshold: 0.005557058844715357,
          right_val: -0.5548262000083923,
          left_val: 0.0299590602517128,
        },
        {
          features: [
            [5, 13, 6, 3, -1],
            [5, 14, 6, 1, 3],
          ],
          threshold: 0.00945299956947565,
          right_val: 0.4013828933238983,
          left_val: -0.0531363897025585,
        },
        {
          features: [
            [12, 12, 1, 3, -1],
            [12, 13, 1, 1, 3],
          ],
          threshold: -0.0006103066261857748,
          right_val: 0.066881351172924,
          left_val: -0.2706044912338257,
        },
        {
          features: [
            [2, 14, 14, 6, -1],
            [2, 17, 14, 3, 2],
          ],
          threshold: -0.1132924035191536,
          right_val: 0.0250429902225733,
          left_val: -0.6517850756645203,
        },
        {
          features: [
            [7, 5, 2, 4, -1],
            [7, 5, 1, 2, 2],
            [8, 7, 1, 2, 2],
          ],
          threshold: -0.00020354389562271535,
          right_val: -0.151743695139885,
          left_val: 0.1089242026209831,
        },
        {
          features: [
            [5, 17, 2, 2, -1],
            [5, 17, 1, 1, 2],
            [6, 18, 1, 1, 2],
          ],
          threshold: -0.001498318975791335,
          right_val: -0.058467049151659,
          left_val: 0.2738873064517975,
        },
        {
          features: [
            [9, 3, 3, 5, -1],
            [10, 3, 1, 5, 3],
          ],
          threshold: 0.007527715992182493,
          right_val: -0.4273988902568817,
          left_val: 0.0409915298223495,
        },
        {
          features: [
            [6, 17, 4, 3, -1],
            [6, 18, 4, 1, 3],
          ],
          threshold: 0.003620917908847332,
          right_val: 0.2606475055217743,
          left_val: -0.0673092380166054,
        },
        {
          features: [
            [10, 0, 6, 4, -1],
            [12, 0, 2, 4, 3],
          ],
          threshold: 0.0121530499309301,
          right_val: -0.3831908106803894,
          left_val: 0.0507682710886002,
        },
        {
          features: [
            [4, 8, 6, 10, -1],
            [4, 8, 3, 5, 2],
            [7, 13, 3, 5, 2],
          ],
          threshold: 0.046126339584589,
          right_val: -0.6503952741622925,
          left_val: 0.0242329891771078,
        },
        {
          features: [
            [4, 3, 2, 6, -1],
            [5, 3, 1, 6, 2],
          ],
          threshold: 0.0007140854140743613,
          right_val: 0.1220854967832565,
          left_val: -0.134763702750206,
        },
        {
          features: [
            [3, 4, 6, 6, -1],
            [5, 4, 2, 6, 3],
          ],
          threshold: -0.004433162044733763,
          right_val: -0.1021870970726013,
          left_val: 0.1993961036205292,
        },
        {
          features: [
            [5, 8, 2, 8, -1],
            [5, 12, 2, 4, 2],
          ],
          threshold: 0.0013099729549139738,
          right_val: -0.2450371980667114,
          left_val: 0.0745170265436172,
        },
        {
          features: [
            [5, 11, 2, 2, -1],
            [5, 12, 2, 1, 2],
          ],
          threshold: 0.000261614506598562,
          right_val: 0.1992460042238236,
          left_val: -0.0842879563570023,
        },
        {
          features: [
            [12, 13, 1, 3, -1],
            [12, 14, 1, 1, 3],
          ],
          threshold: -0.0027577539440244436,
          right_val: 0.0248511098325253,
          left_val: -0.6873446702957153,
        },
        {
          features: [
            [5, 1, 4, 15, -1],
            [5, 6, 4, 5, 3],
          ],
          threshold: 0.069469690322876,
          right_val: -0.3971717953681946,
          left_val: 0.0384387299418449,
        },
        {
          features: [
            [6, 11, 1, 3, -1],
            [6, 12, 1, 1, 3],
          ],
          threshold: -0.0013031469425186515,
          right_val: -0.091723307967186,
          left_val: 0.2008994966745377,
        },
        {
          features: [
            [6, 11, 3, 3, -1],
            [6, 12, 3, 1, 3],
          ],
          threshold: 0.0013012000126764178,
          right_val: 0.1924819052219391,
          left_val: -0.0953058525919914,
        },
        {
          features: [
            [11, 0, 3, 3, -1],
            [12, 0, 1, 3, 3],
          ],
          threshold: -0.003937725909054279,
          right_val: 0.0437380112707615,
          left_val: -0.3922409117221832,
        },
        {
          features: [
            [2, 2, 15, 3, -1],
            [7, 2, 5, 3, 3],
          ],
          threshold: 0.0961257070302963,
          right_val: 0.3744184970855713,
          left_val: -0.0432694405317307,
        },
        {
          features: [
            [4, 0, 16, 5, -1],
            [12, 0, 8, 5, 2],
          ],
          threshold: -0.1918185949325562,
          right_val: 0.0287755392491817,
          left_val: -0.61320561170578,
        },
        {
          features: [
            [13, 7, 6, 8, -1],
            [13, 11, 6, 4, 2],
          ],
          threshold: -0.003294561989605427,
          right_val: 0.077655017375946,
          left_val: -0.2244682013988495,
        },
        {
          features: [
            [9, 9, 3, 4, -1],
            [9, 11, 3, 2, 2],
          ],
          threshold: -0.00851909164339304,
          right_val: -0.0413103885948658,
          left_val: 0.447205513715744,
        },
        {
          features: [
            [5, 2, 6, 16, -1],
            [5, 2, 3, 8, 2],
            [8, 10, 3, 8, 2],
          ],
          threshold: -0.0494314692914486,
          right_val: 0.0368637405335903,
          left_val: -0.5181968212127686,
        },
        {
          features: [
            [10, 7, 6, 3, -1],
            [13, 7, 3, 3, 2],
          ],
          threshold: 0.0231108795851469,
          right_val: 0.5914663076400757,
          left_val: -0.033078420907259,
        },
        {
          features: [
            [12, 11, 2, 1, -1],
            [13, 11, 1, 1, 2],
          ],
          threshold: -0.000043400399590609595,
          right_val: -0.195262998342514,
          left_val: 0.1139502972364426,
        },
        {
          features: [
            [0, 0, 1, 8, -1],
            [0, 4, 1, 4, 2],
          ],
          threshold: 0.005492683965712786,
          right_val: -0.2559199035167694,
          left_val: 0.0616160705685616,
        },
        {
          features: [
            [9, 7, 2, 3, -1],
            [9, 8, 2, 1, 3],
          ],
          threshold: 0.0011886029969900846,
          right_val: 0.2429125010967255,
          left_val: -0.068509116768837,
        },
        {
          features: [
            [6, 5, 4, 15, -1],
            [8, 5, 2, 15, 2],
          ],
          threshold: 0.008847342804074287,
          right_val: -0.2317638993263245,
          left_val: 0.0764672830700874,
        },
        {
          features: [
            [7, 7, 2, 2, -1],
            [8, 7, 1, 2, 2],
          ],
          threshold: 0.002395282033830881,
          right_val: 0.4581176936626434,
          left_val: -0.0446208603680134,
        },
        {
          features: [
            [1, 3, 1, 2, -1],
            [1, 4, 1, 1, 2],
          ],
          threshold: -0.0001501122023910284,
          right_val: 0.1062223985791206,
          left_val: -0.1656074970960617,
        },
        {
          features: [
            [6, 2, 6, 11, -1],
            [9, 2, 3, 11, 2],
          ],
          threshold: -0.0234658997505903,
          right_val: 0.0661793574690819,
          left_val: -0.2493131011724472,
        },
        {
          features: [
            [9, 6, 9, 6, -1],
            [9, 8, 9, 2, 3],
          ],
          threshold: -0.0066368370316922665,
          right_val: -0.1151050999760628,
          left_val: 0.143584206700325,
        },
        {
          features: [
            [9, 8, 3, 3, -1],
            [9, 9, 3, 1, 3],
          ],
          threshold: 0.0011986029567196965,
          right_val: 0.1760554015636444,
          left_val: -0.0983475223183632,
        },
        {
          features: [
            [6, 8, 2, 3, -1],
            [6, 9, 2, 1, 3],
          ],
          threshold: 0.007950207218527794,
          right_val: -0.5017663836479187,
          left_val: 0.0354813784360886,
        },
        {
          features: [
            [13, 1, 2, 8, -1],
            [13, 5, 2, 4, 2],
          ],
          threshold: -0.0004595064965542406,
          right_val: 0.0934000834822655,
          left_val: -0.1692876070737839,
        },
        {
          features: [
            [6, 0, 6, 4, -1],
            [6, 2, 6, 2, 2],
          ],
          threshold: -0.0193010699003935,
          right_val: -0.0511401109397411,
          left_val: 0.4183666110038757,
        },
        {
          features: [
            [0, 6, 20, 14, -1],
            [10, 6, 10, 14, 2],
          ],
          threshold: 0.4016349911689758,
          right_val: -0.6476805806159973,
          left_val: 0.0293589197099209,
        },
      ],
      threshold: -1.6632529497146606,
    },
    {
      simpleClassifiers: [
        {
          features: [
            [8, 0, 12, 6, -1],
            [8, 0, 6, 3, 2],
            [14, 3, 6, 3, 2],
          ],
          threshold: -0.0362842902541161,
          right_val: -0.2584043145179749,
          left_val: 0.4284189939498901,
        },
        {
          features: [
            [8, 7, 9, 9, -1],
            [8, 10, 9, 3, 3],
          ],
          threshold: 0.0305208303034306,
          right_val: 0.2175661027431488,
          left_val: -0.2971504032611847,
        },
        {
          features: [
            [10, 14, 6, 6, -1],
            [10, 14, 3, 3, 2],
            [13, 17, 3, 3, 2],
          ],
          threshold: 0.0033444820437580347,
          right_val: 0.1975443959236145,
          left_val: -0.2173435986042023,
        },
        {
          features: [
            [8, 7, 4, 10, -1],
            [8, 7, 2, 5, 2],
            [10, 12, 2, 5, 2],
          ],
          threshold: -0.0013315919786691666,
          right_val: -0.2313368022441864,
          left_val: 0.155359297990799,
        },
        {
          features: [
            [15, 4, 3, 3, -1],
            [15, 5, 3, 1, 3],
          ],
          threshold: -0.0019773480016738176,
          right_val: 0.0885544270277023,
          left_val: -0.4200130105018616,
        },
        {
          features: [
            [14, 0, 6, 6, -1],
            [16, 0, 2, 6, 3],
          ],
          threshold: -0.00037038238951936364,
          right_val: -0.2387913018465042,
          left_val: 0.1276978999376297,
        },
        {
          features: [
            [5, 9, 10, 6, -1],
            [5, 9, 5, 3, 2],
            [10, 12, 5, 3, 2],
          ],
          threshold: -0.007373645901679993,
          right_val: 0.0297653190791607,
          left_val: -0.4072006046772003,
        },
        {
          features: [
            [11, 12, 2, 1, -1],
            [12, 12, 1, 1, 2],
          ],
          threshold: -0.000021873020159546286,
          right_val: -0.2223708927631378,
          left_val: 0.1233820989727974,
        },
        {
          features: [
            [11, 7, 3, 7, -1],
            [12, 7, 1, 7, 3],
          ],
          threshold: 0.00004557504871627316,
          right_val: 0.1295361965894699,
          left_val: -0.2309291064739227,
        },
        {
          features: [
            [9, 0, 2, 18, -1],
            [9, 0, 1, 9, 2],
            [10, 9, 1, 9, 2],
          ],
          threshold: -0.0112471701577306,
          right_val: 0.0419076606631279,
          left_val: -0.5476273894309998,
        },
        {
          features: [
            [3, 6, 3, 4, -1],
            [4, 6, 1, 4, 3],
          ],
          threshold: -0.008943026885390282,
          right_val: -0.0908012166619301,
          left_val: 0.2794528901576996,
        },
        {
          features: [
            [14, 10, 2, 2, -1],
            [14, 10, 1, 1, 2],
            [15, 11, 1, 1, 2],
          ],
          threshold: 0.000014646670024376363,
          right_val: 0.1496804058551788,
          left_val: -0.167778804898262,
        },
        {
          features: [
            [4, 7, 3, 2, -1],
            [5, 7, 1, 2, 3],
          ],
          threshold: -0.006539835128933191,
          right_val: -0.0719872564077377,
          left_val: 0.3365462124347687,
        },
        {
          features: [
            [10, 14, 4, 3, -1],
            [10, 15, 4, 1, 3],
          ],
          threshold: 0.0033825531136244535,
          right_val: -0.458063006401062,
          left_val: 0.0499318800866604,
        },
        {
          features: [
            [12, 12, 2, 3, -1],
            [12, 13, 2, 1, 3],
          ],
          threshold: 0.0027450500056147575,
          right_val: -0.5711386203765869,
          left_val: 0.0361195094883442,
        },
        {
          features: [
            [3, 0, 2, 8, -1],
            [3, 0, 1, 4, 2],
            [4, 4, 1, 4, 2],
          ],
          threshold: 0.0103563796728849,
          right_val: 0.4212119877338409,
          left_val: -0.0530491583049297,
        },
        {
          features: [
            [14, 4, 5, 3, -1],
            [14, 5, 5, 1, 3],
          ],
          threshold: 0.003168731927871704,
          right_val: -0.3467491865158081,
          left_val: 0.0628499388694763,
        },
        {
          features: [
            [6, 16, 1, 3, -1],
            [6, 17, 1, 1, 3],
          ],
          threshold: 0.0013616570504382253,
          right_val: 0.2525748014450073,
          left_val: -0.0906610563397408,
        },
        {
          features: [
            [5, 16, 2, 3, -1],
            [5, 17, 2, 1, 3],
          ],
          threshold: -0.002223826013505459,
          right_val: -0.0966490805149078,
          left_val: 0.2659519016742706,
        },
        {
          features: [
            [4, 6, 10, 6, -1],
            [4, 6, 5, 3, 2],
            [9, 9, 5, 3, 2],
          ],
          threshold: 0.0110908998176456,
          right_val: -0.3010335862636566,
          left_val: 0.0866380631923676,
        },
        {
          features: [
            [9, 14, 7, 4, -1],
            [9, 16, 7, 2, 2],
          ],
          threshold: -0.0006776615045964718,
          right_val: -0.2146414965391159,
          left_val: 0.0942778289318085,
        },
        {
          features: [
            [10, 11, 2, 4, -1],
            [10, 11, 1, 2, 2],
            [11, 13, 1, 2, 2],
          ],
          threshold: -0.0033104580361396074,
          right_val: 0.0327384881675243,
          left_val: -0.5916264057159424,
        },
        {
          features: [
            [5, 12, 4, 3, -1],
            [5, 13, 4, 1, 3],
          ],
          threshold: 0.0023221869487315416,
          right_val: 0.2054619938135147,
          left_val: -0.0955572500824928,
        },
        {
          features: [
            [5, 13, 3, 2, -1],
            [5, 14, 3, 1, 2],
          ],
          threshold: 0.00030947118648327887,
          right_val: 0.1770471930503845,
          left_val: -0.1299227029085159,
        },
        {
          features: [
            [7, 13, 8, 4, -1],
            [7, 15, 8, 2, 2],
          ],
          threshold: -0.032214168459177,
          right_val: 0.0317492596805096,
          left_val: -0.6466249227523804,
        },
        {
          features: [
            [8, 4, 3, 1, -1],
            [9, 4, 1, 1, 3],
          ],
          threshold: -0.000831927580293268,
          right_val: 0.0610405914485455,
          left_val: -0.3066675066947937,
        },
        {
          features: [
            [6, 1, 1, 4, -1],
            [6, 3, 1, 2, 2],
          ],
          threshold: 0.0003918829024769366,
          right_val: 0.1183035001158714,
          left_val: -0.1579546928405762,
        },
        {
          features: [
            [8, 0, 12, 6, -1],
            [8, 0, 6, 3, 2],
            [14, 3, 6, 3, 2],
          ],
          threshold: -0.0362037383019924,
          right_val: 0.0831830129027367,
          left_val: -0.227312296628952,
        },
        {
          features: [
            [8, 5, 2, 3, -1],
            [8, 6, 2, 1, 3],
          ],
          threshold: 0.0026437509804964066,
          right_val: 0.2354550957679749,
          left_val: -0.076691061258316,
        },
        {
          features: [
            [8, 5, 2, 3, -1],
            [8, 6, 2, 1, 3],
          ],
          threshold: -0.003436831058934331,
          right_val: -0.0736729875206947,
          left_val: 0.3605703115463257,
        },
        {
          features: [
            [7, 4, 3, 1, -1],
            [8, 4, 1, 1, 3],
          ],
          threshold: -0.0005592160159721971,
          right_val: 0.0782756432890892,
          left_val: -0.2534317970275879,
        },
        {
          features: [
            [7, 9, 2, 2, -1],
            [7, 9, 1, 1, 2],
            [8, 10, 1, 1, 2],
          ],
          threshold: 0.00004301013905205764,
          right_val: 0.0975393801927567,
          left_val: -0.1822309941053391,
        },
        {
          features: [
            [15, 14, 4, 6, -1],
            [15, 14, 2, 3, 2],
            [17, 17, 2, 3, 2],
          ],
          threshold: 0.005319267977029085,
          right_val: 0.2422181069850922,
          left_val: -0.076901949942112,
        },
        {
          features: [
            [7, 9, 1, 4, -1],
            [7, 11, 1, 2, 2],
          ],
          threshold: -0.006948450114578009,
          right_val: 0.0346019491553307,
          left_val: -0.5827587246894836,
        },
        {
          features: [
            [10, 11, 3, 9, -1],
            [11, 11, 1, 9, 3],
          ],
          threshold: 0.0124477799981833,
          right_val: -0.6171249747276306,
          left_val: 0.0238836593925953,
        },
        {
          features: [
            [17, 11, 3, 1, -1],
            [18, 11, 1, 1, 3],
          ],
          threshold: 0.0010083100060001016,
          right_val: 0.2474427074193955,
          left_val: -0.0751521810889244,
        },
        {
          features: [
            [17, 11, 3, 1, -1],
            [18, 11, 1, 1, 3],
          ],
          threshold: -0.0023544009309262037,
          right_val: -0.065026231110096,
          left_val: 0.3145940005779266,
        },
        {
          features: [
            [0, 1, 1, 2, -1],
            [0, 2, 1, 1, 2],
          ],
          threshold: 0.0004567686119116843,
          right_val: -0.2377721965312958,
          left_val: 0.0797581970691681,
        },
        {
          features: [
            [9, 15, 7, 3, -1],
            [9, 16, 7, 1, 3],
          ],
          threshold: 0.006672319024801254,
          right_val: -0.4604541957378388,
          left_val: 0.0387791991233826,
        },
        {
          features: [
            [15, 0, 2, 2, -1],
            [16, 0, 1, 2, 2],
          ],
          threshold: 0.000007186181846918771,
          right_val: 0.1253253072500229,
          left_val: -0.1311053931713104,
        },
        {
          features: [
            [5, 0, 1, 14, -1],
            [5, 7, 1, 7, 2],
          ],
          threshold: 0.0303925909101963,
          right_val: -0.538709282875061,
          left_val: 0.0296705309301615,
        },
        {
          features: [
            [7, 3, 1, 2, -1],
            [7, 4, 1, 1, 2],
          ],
          threshold: 0.000014835850379313342,
          right_val: 0.1056685969233513,
          left_val: -0.1577858030796051,
        },
        {
          features: [
            [7, 0, 4, 6, -1],
            [7, 2, 4, 2, 3],
          ],
          threshold: 0.0144158601760864,
          right_val: 0.3059771060943604,
          left_val: -0.0762713477015495,
        },
        {
          features: [
            [7, 2, 3, 2, -1],
            [8, 2, 1, 2, 3],
          ],
          threshold: 0.003278752090409398,
          right_val: -0.3892802894115448,
          left_val: 0.0444643087685108,
        },
        {
          features: [
            [5, 12, 4, 3, -1],
            [5, 13, 4, 1, 3],
          ],
          threshold: 0.010770520195365,
          right_val: 0.4149397909641266,
          left_val: -0.0393240116536617,
        },
        {
          features: [
            [18, 5, 1, 2, -1],
            [18, 6, 1, 1, 2],
          ],
          threshold: 0.0005467826849780977,
          right_val: -0.2754693031311035,
          left_val: 0.0587216913700104,
        },
        {
          features: [
            [18, 0, 2, 10, -1],
            [18, 0, 1, 5, 2],
            [19, 5, 1, 5, 2],
          ],
          threshold: -0.001810649991966784,
          right_val: -0.0936754271388054,
          left_val: 0.1828175038099289,
        },
        {
          features: [
            [0, 2, 13, 6, -1],
            [0, 4, 13, 2, 3],
          ],
          threshold: 0.1177124977111816,
          right_val: -0.7069668173789978,
          left_val: 0.0231757592409849,
        },
        {
          features: [
            [0, 0, 2, 2, -1],
            [0, 0, 1, 1, 2],
            [1, 1, 1, 1, 2],
          ],
          threshold: -0.00031166549888439476,
          right_val: 0.0765738412737846,
          left_val: -0.2058593034744263,
        },
        {
          features: [
            [5, 10, 2, 3, -1],
            [5, 11, 2, 1, 3],
          ],
          threshold: -0.009793941862881184,
          right_val: -0.034746028482914,
          left_val: 0.4873268008232117,
        },
        {
          features: [
            [5, 10, 2, 3, -1],
            [5, 11, 2, 1, 3],
          ],
          threshold: 0.001000278047285974,
          right_val: 0.1549056023359299,
          left_val: -0.110036201775074,
        },
        {
          features: [
            [6, 12, 2, 4, -1],
            [7, 12, 1, 4, 2],
          ],
          threshold: 0.006992923095822334,
          right_val: -0.5432611703872681,
          left_val: 0.0329236090183258,
        },
        {
          features: [
            [7, 9, 4, 10, -1],
            [9, 9, 2, 10, 2],
          ],
          threshold: 0.0341630205512047,
          right_val: -0.7080914974212646,
          left_val: 0.0180628206580877,
        },
        {
          features: [
            [2, 0, 9, 16, -1],
            [2, 8, 9, 8, 2],
          ],
          threshold: -0.2080841064453125,
          right_val: 0.020255820825696,
          left_val: -0.678796112537384,
        },
        {
          features: [
            [10, 3, 2, 8, -1],
            [10, 3, 1, 4, 2],
            [11, 7, 1, 4, 2],
          ],
          threshold: 0.0002488965983502567,
          right_val: 0.0881523564457893,
          left_val: -0.177195206284523,
        },
        {
          features: [
            [1, 2, 12, 3, -1],
            [5, 2, 4, 3, 3],
          ],
          threshold: -0.009335560724139214,
          right_val: -0.094474621117115,
          left_val: 0.1794805973768234,
        },
        {
          features: [
            [4, 6, 2, 3, -1],
            [5, 6, 1, 3, 2],
          ],
          threshold: 0.0002919246908277273,
          right_val: 0.1381925940513611,
          left_val: -0.1378616988658905,
        },
        {
          features: [
            [1, 7, 6, 10, -1],
            [3, 7, 2, 10, 3],
          ],
          threshold: 0.009198922663927078,
          right_val: 0.1761810034513474,
          left_val: -0.1026910990476608,
        },
        {
          features: [
            [1, 14, 2, 1, -1],
            [2, 14, 1, 1, 2],
          ],
          threshold: 0.0006816543755121529,
          right_val: -0.2362183034420013,
          left_val: 0.0748213082551956,
        },
        {
          features: [
            [11, 12, 1, 2, -1],
            [11, 13, 1, 1, 2],
          ],
          threshold: -0.000014507620107906405,
          right_val: -0.1778573989868164,
          left_val: 0.0958617702126503,
        },
        {
          features: [
            [12, 8, 3, 5, -1],
            [13, 8, 1, 5, 3],
          ],
          threshold: 0.00017662490427028388,
          right_val: 0.1339432001113892,
          left_val: -0.1380535960197449,
        },
        {
          features: [
            [6, 5, 9, 6, -1],
            [6, 7, 9, 2, 3],
          ],
          threshold: -0.0017513500060886145,
          right_val: -0.2317402958869934,
          left_val: 0.0776235833764076,
        },
        {
          features: [
            [13, 8, 2, 3, -1],
            [13, 9, 2, 1, 3],
          ],
          threshold: 0.00513420207425952,
          right_val: -0.5242084860801697,
          left_val: 0.0303639695048332,
        },
        {
          features: [
            [7, 15, 6, 4, -1],
            [7, 15, 3, 2, 2],
            [10, 17, 3, 2, 2],
          ],
          threshold: 0.009411431849002838,
          right_val: 0.3029138147830963,
          left_val: -0.0589945688843727,
        },
        {
          features: [
            [10, 15, 6, 3, -1],
            [10, 16, 6, 1, 3],
          ],
          threshold: -0.001044881995767355,
          right_val: 0.1015603020787239,
          left_val: -0.1712469011545181,
        },
        {
          features: [
            [3, 2, 2, 6, -1],
            [3, 2, 1, 3, 2],
            [4, 5, 1, 3, 2],
          ],
          threshold: -0.00635791989043355,
          right_val: -0.0506944507360458,
          left_val: 0.3198671042919159,
        },
        {
          features: [
            [10, 15, 3, 5, -1],
            [11, 15, 1, 5, 3],
          ],
          threshold: -0.006350211799144745,
          right_val: 0.0318000689148903,
          left_val: -0.5241327285766602,
        },
        {
          features: [
            [12, 9, 5, 2, -1],
            [12, 10, 5, 1, 2],
          ],
          threshold: 0.0122517598792911,
          right_val: -0.7942218780517578,
          left_val: 0.0165596809238195,
        },
        {
          features: [
            [4, 11, 10, 1, -1],
            [9, 11, 5, 1, 2],
          ],
          threshold: -0.0140007203444839,
          right_val: 0.0246525593101978,
          left_val: -0.5444440245628357,
        },
        {
          features: [
            [6, 12, 6, 2, -1],
            [6, 12, 3, 1, 2],
            [9, 13, 3, 1, 2],
          ],
          threshold: 0.0019229920580983162,
          right_val: 0.2188820987939835,
          left_val: -0.0769449770450592,
        },
        {
          features: [
            [6, 11, 1, 3, -1],
            [6, 12, 1, 1, 3],
          ],
          threshold: -0.0034030789975076914,
          right_val: -0.0580233298242092,
          left_val: 0.3014340102672577,
        },
        {
          features: [
            [3, 12, 8, 4, -1],
            [3, 12, 4, 2, 2],
            [7, 14, 4, 2, 2],
          ],
          threshold: -0.0277286097407341,
          right_val: 0.0300717204809189,
          left_val: -0.5670499801635742,
        },
        {
          features: [
            [0, 3, 1, 3, -1],
            [0, 4, 1, 1, 3],
          ],
          threshold: 0.00014990579802542925,
          right_val: -0.1698942929506302,
          left_val: 0.0914046168327332,
        },
        {
          features: [
            [10, 12, 2, 1, -1],
            [11, 12, 1, 1, 2],
          ],
          threshold: -0.000014532960449287202,
          right_val: -0.1398334950208664,
          left_val: 0.1044266000390053,
        },
        {
          features: [
            [3, 10, 3, 6, -1],
            [3, 12, 3, 2, 3],
          ],
          threshold: 0.0283159501850605,
          right_val: -0.812012791633606,
          left_val: 0.0178121291100979,
        },
        {
          features: [
            [5, 10, 2, 3, -1],
            [5, 11, 2, 1, 3],
          ],
          threshold: -0.0017363600200042129,
          right_val: -0.0763988196849823,
          left_val: 0.1968863010406494,
        },
        {
          features: [
            [8, 7, 4, 6, -1],
            [8, 9, 4, 2, 3],
          ],
          threshold: -0.0220814906060696,
          right_val: -0.0334458686411381,
          left_val: 0.4449751079082489,
        },
        {
          features: [
            [12, 11, 1, 3, -1],
            [12, 12, 1, 1, 3],
          ],
          threshold: 0.0012189210392534733,
          right_val: -0.3779031038284302,
          left_val: 0.0491547808051109,
        },
        {
          features: [
            [12, 11, 2, 3, -1],
            [12, 12, 2, 1, 3],
          ],
          threshold: -0.0005483889253810048,
          right_val: 0.0804464966058731,
          left_val: -0.2282302975654602,
        },
        {
          features: [
            [6, 10, 2, 2, -1],
            [6, 10, 1, 1, 2],
            [7, 11, 1, 1, 2],
          ],
          threshold: -0.0009370255284011364,
          right_val: -0.0653892010450363,
          left_val: 0.252589613199234,
        },
        {
          features: [
            [3, 10, 9, 6, -1],
            [3, 13, 9, 3, 2],
          ],
          threshold: 0.0124967200681567,
          right_val: -0.4046553075313568,
          left_val: 0.0382158793509007,
        },
        {
          features: [
            [4, 8, 7, 10, -1],
            [4, 13, 7, 5, 2],
          ],
          threshold: -0.0167643707245588,
          right_val: 0.1211981028318405,
          left_val: -0.1450871974229813,
        },
        {
          features: [
            [6, 8, 11, 3, -1],
            [6, 9, 11, 1, 3],
          ],
          threshold: 0.005650432780385017,
          right_val: 0.221944198012352,
          left_val: -0.0871391370892525,
        },
        {
          features: [
            [6, 5, 1, 14, -1],
            [6, 12, 1, 7, 2],
          ],
          threshold: 0.0005261031910777092,
          right_val: -0.2050247043371201,
          left_val: 0.0872220769524574,
        },
        {
          features: [
            [13, 6, 5, 10, -1],
            [13, 11, 5, 5, 2],
          ],
          threshold: 0.0015574200078845024,
          right_val: 0.0944352820515633,
          left_val: -0.1703668981790543,
        },
        {
          features: [
            [2, 0, 13, 15, -1],
            [2, 5, 13, 5, 3],
          ],
          threshold: 0.25609090924263,
          right_val: -0.7405092120170593,
          left_val: 0.0177901107817888,
        },
        {
          features: [
            [6, 7, 2, 2, -1],
            [7, 7, 1, 2, 2],
          ],
          threshold: 0.0033561999443918467,
          right_val: 0.3757339119911194,
          left_val: -0.0426672697067261,
        },
        {
          features: [
            [4, 5, 9, 4, -1],
            [7, 5, 3, 4, 3],
          ],
          threshold: 0.0470729283988476,
          right_val: -0.6452227830886841,
          left_val: 0.0320152193307877,
        },
        {
          features: [
            [6, 7, 3, 3, -1],
            [7, 7, 1, 3, 3],
          ],
          threshold: -0.0022168930154293776,
          right_val: -0.0773726925253868,
          left_val: 0.2075704038143158,
        },
        {
          features: [
            [8, 1, 3, 4, -1],
            [9, 1, 1, 4, 3],
          ],
          threshold: 0.005079642869532108,
          right_val: -0.3772296905517578,
          left_val: 0.0418293289840221,
        },
        {
          features: [
            [8, 11, 7, 2, -1],
            [8, 12, 7, 1, 2],
          ],
          threshold: 0.00007012090645730495,
          right_val: -0.1850626021623612,
          left_val: 0.0810318887233734,
        },
        {
          features: [
            [4, 7, 3, 2, -1],
            [5, 7, 1, 2, 3],
          ],
          threshold: -0.0005220486200414598,
          right_val: -0.1309031993150711,
          left_val: 0.1252845972776413,
        },
        {
          features: [
            [4, 14, 2, 6, -1],
            [4, 14, 1, 3, 2],
            [5, 17, 1, 3, 2],
          ],
          threshold: -0.006160970777273178,
          right_val: -0.0512521788477898,
          left_val: 0.3117778897285461,
        },
        {
          features: [
            [0, 7, 8, 13, -1],
            [4, 7, 4, 13, 2],
          ],
          threshold: -0.2842487990856171,
          right_val: 0.0228110793977976,
          left_val: -0.7034050822257996,
        },
        {
          features: [
            [6, 3, 4, 9, -1],
            [8, 3, 2, 9, 2],
          ],
          threshold: -0.0417467206716537,
          right_val: 0.016686350107193,
          left_val: -0.7891426086425781,
        },
        {
          features: [
            [9, 12, 2, 3, -1],
            [9, 13, 2, 1, 3],
          ],
          threshold: -0.0010051350109279156,
          right_val: 0.0618873983621597,
          left_val: -0.2218129932880402,
        },
        {
          features: [
            [16, 14, 2, 6, -1],
            [16, 14, 1, 3, 2],
            [17, 17, 1, 3, 2],
          ],
          threshold: -0.001390064018778503,
          right_val: -0.0765824019908905,
          left_val: 0.1879747956991196,
        },
        {
          features: [
            [11, 14, 2, 3, -1],
            [11, 15, 2, 1, 3],
          ],
          threshold: -0.0004011837881989777,
          right_val: 0.0868067592382431,
          left_val: -0.1729117035865784,
        },
        {
          features: [
            [11, 14, 1, 2, -1],
            [11, 15, 1, 1, 2],
          ],
          threshold: -0.00002920261067629326,
          right_val: -0.1713646054267883,
          left_val: 0.0923197790980339,
        },
        {
          features: [
            [8, 8, 3, 2, -1],
            [8, 9, 3, 1, 2],
          ],
          threshold: -0.002653283067047596,
          right_val: -0.0398264490067959,
          left_val: 0.3942284882068634,
        },
        {
          features: [
            [13, 1, 3, 5, -1],
            [14, 1, 1, 5, 3],
          ],
          threshold: -0.007893347181379795,
          right_val: 0.0366033613681793,
          left_val: -0.4332689046859741,
        },
        {
          features: [
            [6, 15, 8, 2, -1],
            [6, 15, 4, 1, 2],
            [10, 16, 4, 1, 2],
          ],
          threshold: 0.008793344721198082,
          right_val: 0.4874078929424286,
          left_val: -0.0332059487700462,
        },
        {
          features: [
            [13, 2, 3, 4, -1],
            [14, 2, 1, 4, 3],
          ],
          threshold: 0.0120147597044706,
          right_val: -0.8159726858139038,
          left_val: 0.0222442205995321,
        },
        {
          features: [
            [1, 8, 1, 6, -1],
            [1, 10, 1, 2, 3],
          ],
          threshold: 0.0021147020161151886,
          right_val: -0.2095922976732254,
          left_val: 0.0649429336190224,
        },
        {
          features: [
            [12, 0, 8, 2, -1],
            [12, 0, 4, 1, 2],
            [16, 1, 4, 1, 2],
          ],
          threshold: -0.0009991603437811136,
          right_val: -0.101494699716568,
          left_val: 0.1540234982967377,
        },
        {
          features: [
            [5, 8, 3, 1, -1],
            [6, 8, 1, 1, 3],
          ],
          threshold: -0.000764995813369751,
          right_val: -0.0711996629834175,
          left_val: 0.2023645043373108,
        },
        {
          features: [
            [7, 5, 2, 4, -1],
            [8, 5, 1, 4, 2],
          ],
          threshold: -0.0004219351103529334,
          right_val: -0.1284545958042145,
          left_val: 0.1152143031358719,
        },
        {
          features: [
            [7, 2, 2, 1, -1],
            [8, 2, 1, 1, 2],
          ],
          threshold: -0.00041548791341483593,
          right_val: 0.0703761428594589,
          left_val: -0.2116852998733521,
        },
        {
          features: [
            [0, 4, 2, 3, -1],
            [0, 5, 2, 1, 3],
          ],
          threshold: 0.001530027948319912,
          right_val: -0.2226932048797607,
          left_val: 0.0612637586891651,
        },
        {
          features: [
            [3, 17, 2, 2, -1],
            [3, 17, 1, 1, 2],
            [4, 18, 1, 1, 2],
          ],
          threshold: -0.002657396951690316,
          right_val: -0.038276020437479,
          left_val: 0.3846232891082764,
        },
        {
          features: [
            [6, 0, 12, 9, -1],
            [12, 0, 6, 9, 2],
          ],
          threshold: -0.2198860049247742,
          right_val: 0.0280993897467852,
          left_val: -0.5154678225517273,
        },
        {
          features: [
            [7, 0, 12, 3, -1],
            [11, 0, 4, 3, 3],
          ],
          threshold: -0.0008737720781937242,
          right_val: -0.1399068981409073,
          left_val: 0.1014932990074158,
        },
        {
          features: [
            [14, 0, 6, 6, -1],
            [14, 0, 3, 3, 2],
            [17, 3, 3, 3, 2],
          ],
          threshold: 0.0075169820338487625,
          right_val: 0.2548643052577972,
          left_val: -0.0616716407239437,
        },
        {
          features: [
            [15, 2, 1, 2, -1],
            [15, 3, 1, 1, 2],
          ],
          threshold: -0.00013438290625344962,
          right_val: 0.0889388769865036,
          left_val: -0.1661804020404816,
        },
      ],
      threshold: -1.5384509563446045,
    },
    {
      simpleClassifiers: [
        {
          features: [
            [8, 2, 1, 6, -1],
            [8, 4, 1, 2, 3],
          ],
          threshold: 0.003500751918181777,
          right_val: 0.3362810909748077,
          left_val: -0.2825669050216675,
        },
        {
          features: [
            [5, 7, 3, 2, -1],
            [6, 7, 1, 2, 3],
          ],
          threshold: 0.004104272928088903,
          right_val: 0.3409196138381958,
          left_val: -0.1587762981653214,
        },
        {
          features: [
            [6, 7, 4, 6, -1],
            [6, 10, 4, 3, 2],
          ],
          threshold: 0.0009872440714389086,
          right_val: 0.1177171990275383,
          left_val: -0.4609476029872894,
        },
        {
          features: [
            [8, 6, 10, 2, -1],
            [13, 6, 5, 2, 2],
          ],
          threshold: -0.0040168981067836285,
          right_val: -0.384766012430191,
          left_val: 0.1399492025375366,
        },
        {
          features: [
            [2, 1, 4, 15, -1],
            [4, 1, 2, 15, 2],
          ],
          threshold: -0.0427845008671284,
          right_val: -0.1167381033301354,
          left_val: 0.3151994943618774,
        },
        {
          features: [
            [5, 9, 3, 6, -1],
            [5, 12, 3, 3, 2],
          ],
          threshold: -0.0005627350183203816,
          right_val: -0.3359470069408417,
          left_val: 0.0823151096701622,
        },
        {
          features: [
            [12, 11, 2, 1, -1],
            [13, 11, 1, 1, 2],
          ],
          threshold: -0.000043416650441940874,
          right_val: -0.2506802976131439,
          left_val: 0.1069177985191345,
        },
        {
          features: [
            [6, 4, 6, 2, -1],
            [8, 4, 2, 2, 3],
          ],
          threshold: 0.0153475701808929,
          right_val: -0.6461243033409119,
          left_val: 0.009738382883369923,
        },
        {
          features: [
            [12, 9, 4, 8, -1],
            [12, 13, 4, 4, 2],
          ],
          threshold: 0.0018295480404049158,
          right_val: -0.2963764071464539,
          left_val: 0.0891644433140755,
        },
        {
          features: [
            [15, 8, 2, 4, -1],
            [15, 10, 2, 2, 2],
          ],
          threshold: 0.0003209887945558876,
          right_val: 0.114784799516201,
          left_val: -0.231367900967598,
        },
        {
          features: [
            [6, 12, 3, 3, -1],
            [6, 13, 3, 1, 3],
          ],
          threshold: 0.0010728760389611125,
          right_val: 0.1965368986129761,
          left_val: -0.1298218965530396,
        },
        {
          features: [
            [6, 12, 2, 3, -1],
            [6, 13, 2, 1, 3],
          ],
          threshold: -0.004956601187586784,
          right_val: -0.0769897773861885,
          left_val: 0.3531399965286255,
        },
        {
          features: [
            [5, 10, 4, 6, -1],
            [7, 10, 2, 6, 2],
          ],
          threshold: -0.0016319400165230036,
          right_val: 0.1031965985894203,
          left_val: -0.2370198965072632,
        },
        {
          features: [
            [7, 8, 2, 9, -1],
            [7, 11, 2, 3, 3],
          ],
          threshold: 0.019862050190568,
          right_val: -0.4095511138439179,
          left_val: 0.0591875985264778,
        },
        {
          features: [
            [5, 13, 4, 3, -1],
            [5, 14, 4, 1, 3],
          ],
          threshold: -0.009520548395812511,
          right_val: -0.0576475784182549,
          left_val: 0.390617698431015,
        },
        {
          features: [
            [11, 12, 2, 2, -1],
            [11, 12, 1, 1, 2],
            [12, 13, 1, 1, 2],
          ],
          threshold: -0.0010885810479521751,
          right_val: 0.0449610017240047,
          left_val: -0.5290268063545227,
        },
        {
          features: [
            [5, 13, 5, 3, -1],
            [5, 14, 5, 1, 3],
          ],
          threshold: 0.0035348529927432537,
          right_val: 0.2444998025894165,
          left_val: -0.0927075371146202,
        },
        {
          features: [
            [4, 9, 8, 1, -1],
            [8, 9, 4, 1, 2],
          ],
          threshold: 0.005717480089515448,
          right_val: -0.3987899124622345,
          left_val: 0.0573061890900135,
        },
        {
          features: [
            [12, 0, 8, 6, -1],
            [12, 0, 4, 3, 2],
            [16, 3, 4, 3, 2],
          ],
          threshold: -0.0014010589802637696,
          right_val: -0.1952082067728043,
          left_val: 0.1075778007507324,
        },
        {
          features: [
            [11, 12, 1, 2, -1],
            [11, 13, 1, 1, 2],
          ],
          threshold: -0.002230623969808221,
          right_val: 0.0278753396123648,
          left_val: -0.6132832765579224,
        },
        {
          features: [
            [8, 4, 3, 3, -1],
            [9, 4, 1, 3, 3],
          ],
          threshold: -0.005058307200670242,
          right_val: 0.0304825305938721,
          left_val: -0.5473973155021667,
        },
        {
          features: [
            [8, 0, 7, 15, -1],
            [8, 5, 7, 5, 3],
          ],
          threshold: 0.1372572034597397,
          right_val: -0.6081774830818176,
          left_val: 0.0281623005867004,
        },
        {
          features: [
            [3, 0, 8, 4, -1],
            [3, 0, 4, 2, 2],
            [7, 2, 4, 2, 2],
          ],
          threshold: 0.0037828299682587385,
          right_val: 0.1338230967521668,
          left_val: -0.1264097988605499,
        },
        {
          features: [
            [0, 11, 20, 1, -1],
            [10, 11, 10, 1, 2],
          ],
          threshold: -0.0106290299445391,
          right_val: 0.0999545827507973,
          left_val: -0.1734337955713272,
        },
        {
          features: [
            [3, 14, 3, 2, -1],
            [4, 14, 1, 2, 3],
          ],
          threshold: 0.0056623672135174274,
          right_val: 0.329408198595047,
          left_val: -0.0524192303419113,
        },
        {
          features: [
            [3, 11, 3, 8, -1],
            [4, 11, 1, 8, 3],
          ],
          threshold: -0.00459010386839509,
          right_val: -0.0926810428500175,
          left_val: 0.1878466010093689,
        },
        {
          features: [
            [7, 13, 2, 5, -1],
            [8, 13, 1, 5, 2],
          ],
          threshold: 0.007108874153345823,
          right_val: -0.579681396484375,
          left_val: 0.0326054096221924,
        },
        {
          features: [
            [14, 4, 3, 3, -1],
            [14, 5, 3, 1, 3],
          ],
          threshold: -0.0019310249481350183,
          right_val: 0.0586587004363537,
          left_val: -0.2870723903179169,
        },
        {
          features: [
            [5, 11, 2, 3, -1],
            [5, 12, 2, 1, 3],
          ],
          threshold: 0.0035559700336307287,
          right_val: 0.3023276031017304,
          left_val: -0.0628413930535316,
        },
        {
          features: [
            [6, 12, 1, 2, -1],
            [6, 13, 1, 1, 2],
          ],
          threshold: 0.00021007249597460032,
          right_val: 0.2072288990020752,
          left_val: -0.1202944964170456,
        },
        {
          features: [
            [5, 13, 3, 1, -1],
            [6, 13, 1, 1, 3],
          ],
          threshold: 0.0030181880574673414,
          right_val: -0.4556720852851868,
          left_val: 0.0427644215524197,
        },
        {
          features: [
            [12, 11, 1, 3, -1],
            [12, 12, 1, 1, 3],
          ],
          threshold: -0.002091937931254506,
          right_val: 0.0247723907232285,
          left_val: -0.5806704163551331,
        },
        {
          features: [
            [5, 10, 2, 3, -1],
            [5, 11, 2, 1, 3],
          ],
          threshold: 0.00493802921846509,
          right_val: 0.2671546041965485,
          left_val: -0.0678257793188095,
        },
        {
          features: [
            [5, 9, 1, 3, -1],
            [5, 10, 1, 1, 3],
          ],
          threshold: 0.0010227119782939553,
          right_val: 0.1713601052761078,
          left_val: -0.1105057969689369,
        },
        {
          features: [
            [1, 9, 12, 9, -1],
            [1, 12, 12, 3, 3],
          ],
          threshold: -0.0912167131900787,
          right_val: 0.0311765093356371,
          left_val: -0.556174099445343,
        },
        {
          features: [
            [12, 14, 3, 3, -1],
            [12, 15, 3, 1, 3],
          ],
          threshold: 0.0019377609714865685,
          right_val: -0.3340210020542145,
          left_val: 0.0524700693786144,
        },
        {
          features: [
            [10, 14, 5, 3, -1],
            [10, 15, 5, 1, 3],
          ],
          threshold: -0.004523523151874542,
          right_val: 0.0448835305869579,
          left_val: -0.3862803876399994,
        },
        {
          features: [
            [5, 11, 3, 3, -1],
            [5, 12, 3, 1, 3],
          ],
          threshold: 0.0011070469627156854,
          right_val: 0.1769437044858933,
          left_val: -0.0946480110287666,
        },
        {
          features: [
            [5, 11, 2, 6, -1],
            [5, 14, 2, 3, 2],
          ],
          threshold: -0.0145228896290064,
          right_val: 0.0406540706753731,
          left_val: -0.4485464096069336,
        },
        {
          features: [
            [6, 5, 2, 14, -1],
            [6, 12, 2, 7, 2],
          ],
          threshold: 0.0208956394344568,
          right_val: -0.4431704878807068,
          left_val: 0.0359883904457092,
        },
        {
          features: [
            [2, 8, 5, 2, -1],
            [2, 9, 5, 1, 2],
          ],
          threshold: 0.000007327379080379615,
          right_val: 0.0881317630410194,
          left_val: -0.1973697990179062,
        },
        {
          features: [
            [10, 14, 1, 2, -1],
            [10, 15, 1, 1, 2],
          ],
          threshold: -0.000014750339687452652,
          right_val: -0.1938769966363907,
          left_val: 0.0882030129432678,
        },
        {
          features: [
            [7, 14, 4, 6, -1],
            [7, 16, 4, 2, 3],
          ],
          threshold: 0.010160019621253,
          right_val: 0.2772558927536011,
          left_val: -0.0736835226416588,
        },
        {
          features: [
            [8, 12, 3, 1, -1],
            [9, 12, 1, 1, 3],
          ],
          threshold: 0.000014658429790870287,
          right_val: 0.1116539016366005,
          left_val: -0.1351404041051865,
        },
        {
          features: [
            [4, 8, 3, 1, -1],
            [5, 8, 1, 1, 3],
          ],
          threshold: 0.0029789519030600786,
          right_val: 0.2903389930725098,
          left_val: -0.0563563890755177,
        },
        {
          features: [
            [3, 6, 3, 4, -1],
            [4, 6, 1, 4, 3],
          ],
          threshold: 0.006790793035179377,
          right_val: 0.2965075075626373,
          left_val: -0.0554680600762367,
        },
        {
          features: [
            [4, 4, 3, 8, -1],
            [4, 8, 3, 4, 2],
          ],
          threshold: 0.0357466191053391,
          right_val: -0.3794310092926025,
          left_val: 0.0442322716116905,
        },
        {
          features: [
            [12, 5, 2, 2, -1],
            [12, 6, 2, 1, 2],
          ],
          threshold: -0.0008602386806160212,
          right_val: 0.063983328640461,
          left_val: -0.2552424073219299,
        },
        {
          features: [
            [16, 10, 2, 2, -1],
            [16, 10, 1, 1, 2],
            [17, 11, 1, 1, 2],
          ],
          threshold: -0.003274935996159911,
          right_val: -0.0308024100959301,
          left_val: 0.5164237022399902,
        },
        {
          features: [
            [0, 0, 2, 1, -1],
            [1, 0, 1, 1, 2],
          ],
          threshold: -0.00014287419617176056,
          right_val: 0.0902005508542061,
          left_val: -0.1701482981443405,
        },
        {
          features: [
            [7, 0, 5, 8, -1],
            [7, 4, 5, 4, 2],
          ],
          threshold: -0.0592520609498024,
          right_val: -0.0348029993474483,
          left_val: 0.4478740096092224,
        },
        {
          features: [
            [4, 5, 8, 10, -1],
            [4, 5, 4, 5, 2],
            [8, 10, 4, 5, 2],
          ],
          threshold: 0.0491697415709496,
          right_val: -0.3933770060539246,
          left_val: 0.0437972284853458,
        },
        {
          features: [
            [7, 5, 3, 3, -1],
            [7, 6, 3, 1, 3],
          ],
          threshold: 0.0024047859478741884,
          right_val: 0.1759777069091797,
          left_val: -0.085982158780098,
        },
        {
          features: [
            [10, 6, 10, 14, -1],
            [10, 13, 10, 7, 2],
          ],
          threshold: -0.0885699987411499,
          right_val: 0.0567525215446949,
          left_val: -0.2969442903995514,
        },
        {
          features: [
            [8, 6, 2, 3, -1],
            [8, 7, 2, 1, 3],
          ],
          threshold: 0.0035266599152237177,
          right_val: 0.3235999047756195,
          left_val: -0.0541605390608311,
        },
        {
          features: [
            [13, 10, 1, 4, -1],
            [13, 12, 1, 2, 2],
          ],
          threshold: -0.00001467435959057184,
          right_val: -0.171959400177002,
          left_val: 0.1009529978036881,
        },
        {
          features: [
            [3, 9, 12, 4, -1],
            [3, 9, 6, 2, 2],
            [9, 11, 6, 2, 2],
          ],
          threshold: -0.0106728803366423,
          right_val: 0.0396874994039536,
          left_val: -0.3910335898399353,
        },
        {
          features: [
            [7, 14, 3, 6, -1],
            [7, 16, 3, 2, 3],
          ],
          threshold: -0.0131775699555874,
          right_val: -0.0555244088172913,
          left_val: 0.2746025025844574,
        },
        {
          features: [
            [10, 10, 3, 2, -1],
            [11, 10, 1, 2, 3],
          ],
          threshold: -0.002042799023911357,
          right_val: 0.0511519387364388,
          left_val: -0.3261694014072418,
        },
        {
          features: [
            [3, 4, 10, 4, -1],
            [3, 4, 5, 2, 2],
            [8, 6, 5, 2, 2],
          ],
          threshold: 0.0254307091236115,
          right_val: -0.3912068009376526,
          left_val: 0.0344121493399143,
        },
        {
          features: [
            [4, 10, 4, 3, -1],
            [4, 11, 4, 1, 3],
          ],
          threshold: 0.006657562218606472,
          right_val: 0.2549391090869904,
          left_val: -0.062124639749527,
        },
        {
          features: [
            [5, 3, 6, 4, -1],
            [5, 3, 3, 2, 2],
            [8, 5, 3, 2, 2],
          ],
          threshold: -0.0249226298183203,
          right_val: 0.0205200500786304,
          left_val: -0.7561764717102051,
        },
        {
          features: [
            [6, 8, 6, 10, -1],
            [9, 8, 3, 10, 2],
          ],
          threshold: 0.0648694783449173,
          right_val: -0.8518260717391968,
          left_val: 0.0135357603430748,
        },
        {
          features: [
            [10, 15, 6, 3, -1],
            [10, 16, 6, 1, 3],
          ],
          threshold: -0.0019129139836877584,
          right_val: 0.0688096135854721,
          left_val: -0.2060957998037338,
        },
        {
          features: [
            [3, 4, 3, 7, -1],
            [4, 4, 1, 7, 3],
          ],
          threshold: -0.002728085033595562,
          right_val: -0.1130895987153053,
          left_val: 0.1385322064161301,
        },
        {
          features: [
            [3, 3, 3, 11, -1],
            [4, 3, 1, 11, 3],
          ],
          threshold: 0.00396476686000824,
          right_val: 0.1886792927980423,
          left_val: -0.085980050265789,
        },
        {
          features: [
            [7, 14, 5, 3, -1],
            [7, 15, 5, 1, 3],
          ],
          threshold: 0.0000868665665620938,
          right_val: 0.1154389008879662,
          left_val: -0.1340935975313187,
        },
        {
          features: [
            [17, 11, 2, 2, -1],
            [17, 11, 1, 1, 2],
            [18, 12, 1, 1, 2],
          ],
          threshold: -0.001068043988198042,
          right_val: -0.0595842301845551,
          left_val: 0.2404395937919617,
        },
        {
          features: [
            [9, 0, 3, 4, -1],
            [10, 0, 1, 4, 3],
          ],
          threshold: 0.006497319787740707,
          right_val: -0.4382789134979248,
          left_val: 0.0357217416167259,
        },
        {
          features: [
            [11, 1, 3, 1, -1],
            [12, 1, 1, 1, 3],
          ],
          threshold: 0.00033825050923042,
          right_val: -0.1924086958169937,
          left_val: 0.0751887708902359,
        },
        {
          features: [
            [17, 11, 2, 2, -1],
            [17, 11, 1, 1, 2],
            [18, 12, 1, 1, 2],
          ],
          threshold: 0.0024638089817017317,
          right_val: 0.4139853119850159,
          left_val: -0.0381082482635975,
        },
        {
          features: [
            [0, 10, 2, 1, -1],
            [1, 10, 1, 1, 2],
          ],
          threshold: 0.0007162978872656822,
          right_val: -0.2312994003295898,
          left_val: 0.0676755607128143,
        },
        {
          features: [
            [17, 0, 2, 8, -1],
            [17, 0, 1, 4, 2],
            [18, 4, 1, 4, 2],
          ],
          threshold: -0.0011354340240359306,
          right_val: -0.0982241407036781,
          left_val: 0.1641391962766647,
        },
        {
          features: [
            [6, 7, 6, 2, -1],
            [8, 7, 2, 2, 3],
          ],
          threshold: -0.0004602448898367584,
          right_val: -0.181912899017334,
          left_val: 0.078879103064537,
        },
        {
          features: [
            [5, 7, 6, 9, -1],
            [8, 7, 3, 9, 2],
          ],
          threshold: -0.008147431537508965,
          right_val: 0.0776966735720634,
          left_val: -0.1862782984972,
        },
        {
          features: [
            [6, 8, 9, 3, -1],
            [9, 8, 3, 3, 3],
          ],
          threshold: -0.0338823311030865,
          right_val: -0.0401093512773514,
          left_val: 0.4181846082210541,
        },
        {
          features: [
            [11, 7, 6, 4, -1],
            [13, 7, 2, 4, 3],
          ],
          threshold: -0.004339579027146101,
          right_val: -0.0835095569491386,
          left_val: 0.189618393778801,
        },
        {
          features: [
            [8, 5, 2, 2, -1],
            [9, 5, 1, 2, 2],
          ],
          threshold: 0.0024691419675946236,
          right_val: -0.3828414082527161,
          left_val: 0.0437569916248322,
        },
        {
          features: [
            [15, 3, 4, 10, -1],
            [15, 8, 4, 5, 2],
          ],
          threshold: 0.0876881778240204,
          right_val: -0.5999131798744202,
          left_val: 0.0234664306044579,
        },
        {
          features: [
            [9, 2, 1, 2, -1],
            [9, 3, 1, 1, 2],
          ],
          threshold: 0.00000712772589395172,
          right_val: 0.0941810384392738,
          left_val: -0.145749494433403,
        },
        {
          features: [
            [7, 15, 8, 2, -1],
            [7, 15, 4, 1, 2],
            [11, 16, 4, 1, 2],
          ],
          threshold: -0.002286355011165142,
          right_val: -0.0626305416226387,
          left_val: 0.2217684984207153,
        },
        {
          features: [
            [6, 5, 2, 9, -1],
            [7, 5, 1, 9, 2],
          ],
          threshold: -0.000014718780221301131,
          right_val: -0.1340776979923248,
          left_val: 0.1121044009923935,
        },
        {
          features: [
            [6, 6, 2, 4, -1],
            [7, 6, 1, 4, 2],
          ],
          threshold: 0.0029124629218131304,
          right_val: 0.269210696220398,
          left_val: -0.0611139312386513,
        },
        {
          features: [
            [10, 15, 2, 4, -1],
            [11, 15, 1, 4, 2],
          ],
          threshold: -0.000725323217920959,
          right_val: 0.0902047231793404,
          left_val: -0.1831759065389633,
        },
        {
          features: [
            [9, 17, 3, 2, -1],
            [10, 17, 1, 2, 3],
          ],
          threshold: -0.0017109309555962682,
          right_val: 0.0568658001720905,
          left_val: -0.2915098071098328,
        },
        {
          features: [
            [12, 9, 7, 4, -1],
            [12, 11, 7, 2, 2],
          ],
          threshold: 0.0350501388311386,
          right_val: -0.599260687828064,
          left_val: 0.0242599993944168,
        },
        {
          features: [
            [5, 9, 9, 3, -1],
            [8, 9, 3, 3, 3],
          ],
          threshold: 0.0251192599534988,
          right_val: 0.3307805955410004,
          left_val: -0.046499390155077,
        },
        {
          features: [
            [5, 8, 6, 5, -1],
            [8, 8, 3, 5, 2],
          ],
          threshold: 0.0139249796047807,
          right_val: -0.3243145942687988,
          left_val: 0.0543940998613834,
        },
        {
          features: [
            [7, 16, 4, 3, -1],
            [7, 17, 4, 1, 3],
          ],
          threshold: 0.0012507860083132982,
          right_val: 0.1608397960662842,
          left_val: -0.0862751007080078,
        },
        {
          features: [
            [15, 4, 4, 3, -1],
            [15, 5, 4, 1, 3],
          ],
          threshold: 0.003234734060242772,
          right_val: -0.3341436982154846,
          left_val: 0.0402146689593792,
        },
        {
          features: [
            [16, 10, 2, 2, -1],
            [16, 10, 1, 1, 2],
            [17, 11, 1, 1, 2],
          ],
          threshold: 0.0023993090726435184,
          right_val: 0.403329610824585,
          left_val: -0.036099448800087,
        },
        {
          features: [
            [5, 6, 6, 9, -1],
            [8, 6, 3, 9, 2],
          ],
          threshold: -0.0644688606262207,
          right_val: 0.0171044394373894,
          left_val: -0.9235547184944153,
        },
        {
          features: [
            [10, 0, 10, 6, -1],
            [10, 0, 5, 3, 2],
            [15, 3, 5, 3, 2],
          ],
          threshold: 0.026983879506588,
          right_val: 0.3809542059898377,
          left_val: -0.041323971003294,
        },
        {
          features: [
            [13, 14, 1, 2, -1],
            [13, 15, 1, 1, 2],
          ],
          threshold: -0.000014244250451156404,
          right_val: -0.138547495007515,
          left_val: 0.0984536781907082,
        },
        {
          features: [
            [10, 4, 3, 1, -1],
            [11, 4, 1, 1, 3],
          ],
          threshold: 0.003630429971963167,
          right_val: -0.577401876449585,
          left_val: 0.0225328207015991,
        },
        {
          features: [
            [6, 16, 1, 3, -1],
            [6, 17, 1, 1, 3],
          ],
          threshold: -0.00275094504468143,
          right_val: -0.0490126796066761,
          left_val: 0.2865664958953857,
        },
        {
          features: [
            [11, 13, 4, 3, -1],
            [11, 14, 4, 1, 3],
          ],
          threshold: 0.0034084690269082785,
          right_val: -0.3518727123737335,
          left_val: 0.0385661609470844,
        },
        {
          features: [
            [14, 10, 6, 6, -1],
            [14, 10, 3, 3, 2],
            [17, 13, 3, 3, 2],
          ],
          threshold: -0.0020442469976842403,
          right_val: -0.0812809988856316,
          left_val: 0.1549983024597168,
        },
        {
          features: [
            [1, 1, 1, 2, -1],
            [1, 2, 1, 1, 2],
          ],
          threshold: -0.00033763761166483164,
          right_val: 0.0734975412487984,
          left_val: -0.1896982043981552,
        },
        {
          features: [
            [6, 15, 1, 3, -1],
            [6, 16, 1, 1, 3],
          ],
          threshold: -0.001964973984286189,
          right_val: -0.0536984503269196,
          left_val: 0.2403029948472977,
        },
        {
          features: [
            [7, 15, 1, 3, -1],
            [7, 16, 1, 1, 3],
          ],
          threshold: 0.00026115038781426847,
          right_val: 0.1455180048942566,
          left_val: -0.1058589965105057,
        },
        {
          features: [
            [8, 16, 3, 2, -1],
            [9, 16, 1, 2, 3],
          ],
          threshold: -0.002449620049446821,
          right_val: 0.0439496412873268,
          left_val: -0.3351194858551025,
        },
        {
          features: [
            [5, 8, 3, 9, -1],
            [6, 8, 1, 9, 3],
          ],
          threshold: 0.0257911700755358,
          right_val: -0.6313567757606506,
          left_val: 0.0194439701735973,
        },
        {
          features: [
            [3, 3, 2, 10, -1],
            [3, 3, 1, 5, 2],
            [4, 8, 1, 5, 2],
          ],
          threshold: -0.0017996380338445306,
          right_val: -0.0896696224808693,
          left_val: 0.1562016010284424,
        },
        {
          features: [
            [3, 6, 3, 1, -1],
            [4, 6, 1, 1, 3],
          ],
          threshold: -0.00551907392218709,
          right_val: -0.0393082201480865,
          left_val: 0.3842960000038147,
        },
        {
          features: [
            [2, 0, 2, 1, -1],
            [3, 0, 1, 1, 2],
          ],
          threshold: 0.0009307608124800026,
          right_val: -0.2748290002346039,
          left_val: 0.0531460605561733,
        },
        {
          features: [
            [7, 13, 2, 3, -1],
            [7, 14, 2, 1, 3],
          ],
          threshold: 0.002775477012619376,
          right_val: 0.2487884014844894,
          left_val: -0.0534882806241512,
        },
        {
          features: [
            [7, 9, 1, 9, -1],
            [7, 12, 1, 3, 3],
          ],
          threshold: 0.0019387940410524607,
          right_val: -0.1943241953849793,
          left_val: 0.075177863240242,
        },
        {
          features: [
            [7, 8, 1, 9, -1],
            [7, 11, 1, 3, 3],
          ],
          threshold: -0.0040069930255413055,
          right_val: 0.06200036033988,
          left_val: -0.2733064889907837,
        },
        {
          features: [
            [15, 7, 3, 10, -1],
            [16, 7, 1, 10, 3],
          ],
          threshold: 0.00745409308001399,
          right_val: 0.2705546915531158,
          left_val: -0.0509779490530491,
        },
        {
          features: [
            [14, 7, 6, 10, -1],
            [16, 7, 2, 10, 3],
          ],
          threshold: -0.001633872976526618,
          right_val: -0.1482111066579819,
          left_val: 0.1092085018754005,
        },
        {
          features: [
            [2, 12, 18, 6, -1],
            [2, 14, 18, 2, 3],
          ],
          threshold: -0.116268701851368,
          right_val: 0.0145114399492741,
          left_val: -0.9430736899375916,
        },
        {
          features: [
            [0, 9, 12, 1, -1],
            [4, 9, 4, 1, 3],
          ],
          threshold: -0.012051310390234,
          right_val: 0.0377263091504574,
          left_val: -0.3096499145030975,
        },
        {
          features: [
            [1, 7, 3, 6, -1],
            [2, 7, 1, 6, 3],
          ],
          threshold: 0.0155920004472137,
          right_val: 0.3670614063739777,
          left_val: -0.0385263487696648,
        },
        {
          features: [
            [5, 6, 8, 1, -1],
            [9, 6, 4, 1, 2],
          ],
          threshold: -0.0011198739521205425,
          right_val: 0.0960570424795151,
          left_val: -0.1464426070451737,
        },
        {
          features: [
            [10, 14, 2, 1, -1],
            [11, 14, 1, 1, 2],
          ],
          threshold: -0.0000146233996929368,
          right_val: -0.1339446008205414,
          left_val: 0.1064181998372078,
        },
        {
          features: [
            [14, 8, 6, 10, -1],
            [16, 8, 2, 10, 3],
          ],
          threshold: -0.1031963974237442,
          right_val: 0.0188917703926563,
          left_val: -0.7019655704498291,
        },
      ],
      threshold: -1.5079799890518188,
    },
    {
      simpleClassifiers: [
        {
          features: [
            [10, 5, 8, 7, -1],
            [14, 5, 4, 7, 2],
          ],
          threshold: -0.0374694317579269,
          right_val: -0.3520519137382507,
          left_val: 0.2907924950122833,
        },
        {
          features: [
            [8, 5, 8, 4, -1],
            [8, 5, 4, 2, 2],
            [12, 7, 4, 2, 2],
          ],
          threshold: 0.004086181987076998,
          right_val: 0.1844502985477448,
          left_val: -0.2909860014915466,
        },
        {
          features: [
            [11, 11, 1, 8, -1],
            [11, 15, 1, 4, 2],
          ],
          threshold: -0.0009244689717888832,
          right_val: -0.4106451869010925,
          left_val: 0.1108753010630608,
        },
        {
          features: [
            [5, 6, 2, 4, -1],
            [6, 6, 1, 4, 2],
          ],
          threshold: 0.0008580369758419693,
          right_val: 0.1546505987644196,
          left_val: -0.2212982028722763,
        },
        {
          features: [
            [7, 8, 2, 2, -1],
            [7, 9, 2, 1, 2],
          ],
          threshold: 0.00023659599537495524,
          right_val: 0.1118369027972221,
          left_val: -0.3218517899513245,
        },
        {
          features: [
            [0, 2, 8, 11, -1],
            [4, 2, 4, 11, 2],
          ],
          threshold: -0.0350210294127464,
          right_val: -0.1415652930736542,
          left_val: 0.2272146046161652,
        },
        {
          features: [
            [8, 6, 8, 8, -1],
            [8, 10, 8, 4, 2],
          ],
          threshold: -0.0034688229206949472,
          right_val: 0.0437915287911892,
          left_val: -0.4024738073348999,
        },
        {
          features: [
            [4, 4, 2, 6, -1],
            [5, 4, 1, 6, 2],
          ],
          threshold: 0.005037209019064903,
          right_val: 0.2270132005214691,
          left_val: -0.1238728016614914,
        },
        {
          features: [
            [13, 12, 1, 2, -1],
            [13, 13, 1, 1, 2],
          ],
          threshold: -0.001192961004562676,
          right_val: 0.0525685101747513,
          left_val: -0.4869248867034912,
        },
        {
          features: [
            [3, 8, 3, 2, -1],
            [4, 8, 1, 2, 3],
          ],
          threshold: 0.009556122124195099,
          right_val: 0.5114902853965759,
          left_val: -0.046204000711441,
        },
        {
          features: [
            [13, 12, 1, 3, -1],
            [13, 13, 1, 1, 3],
          ],
          threshold: 0.0011109219631180167,
          right_val: -0.4527831077575684,
          left_val: 0.0454968810081482,
        },
        {
          features: [
            [9, 19, 4, 1, -1],
            [11, 19, 2, 1, 2],
          ],
          threshold: 0.00005783564120065421,
          right_val: 0.1327690929174423,
          left_val: -0.1564171016216278,
        },
        {
          features: [
            [15, 4, 2, 3, -1],
            [15, 5, 2, 1, 3],
          ],
          threshold: -0.0009459584834985435,
          right_val: 0.064549557864666,
          left_val: -0.284713089466095,
        },
        {
          features: [
            [5, 11, 11, 4, -1],
            [5, 13, 11, 2, 2],
          ],
          threshold: 0.0008858757792040706,
          right_val: -0.325058788061142,
          left_val: 0.0659902766346931,
        },
        {
          features: [
            [7, 12, 1, 3, -1],
            [7, 13, 1, 1, 3],
          ],
          threshold: 0.00211805896833539,
          right_val: 0.3313274085521698,
          left_val: -0.0718209072947502,
        },
        {
          features: [
            [6, 12, 4, 4, -1],
            [6, 14, 4, 2, 2],
          ],
          threshold: -0.0160044692456722,
          right_val: 0.0357587598264217,
          left_val: -0.4926666021347046,
        },
        {
          features: [
            [7, 11, 1, 3, -1],
            [7, 12, 1, 1, 3],
          ],
          threshold: 0.0014956319937482476,
          right_val: 0.2761321067810059,
          left_val: -0.0830955430865288,
        },
        {
          features: [
            [9, 10, 3, 3, -1],
            [10, 10, 1, 3, 3],
          ],
          threshold: 0.007520461920648813,
          right_val: -0.6550794839859009,
          left_val: 0.0269876793026924,
        },
        {
          features: [
            [10, 12, 2, 1, -1],
            [11, 12, 1, 1, 2],
          ],
          threshold: -0.000014567610378435347,
          right_val: -0.1827971041202545,
          left_val: 0.1118192970752716,
        },
        {
          features: [
            [7, 1, 12, 16, -1],
            [7, 1, 6, 8, 2],
            [13, 9, 6, 8, 2],
          ],
          threshold: 0.0015564640052616596,
          right_val: 0.1127140000462532,
          left_val: -0.1568105965852737,
        },
        {
          features: [
            [10, 5, 8, 7, -1],
            [14, 5, 4, 7, 2],
          ],
          threshold: -0.0365227982401848,
          right_val: 0.1302226930856705,
          left_val: -0.1425486952066422,
        },
        {
          features: [
            [18, 8, 2, 10, -1],
            [18, 8, 1, 5, 2],
            [19, 13, 1, 5, 2],
          ],
          threshold: 0.009467784315347672,
          right_val: 0.3652131855487824,
          left_val: -0.0434319004416466,
        },
        {
          features: [
            [12, 11, 2, 2, -1],
            [13, 11, 1, 2, 2],
          ],
          threshold: -0.000014508370441035368,
          right_val: -0.2037386000156403,
          left_val: 0.0840565115213394,
        },
        {
          features: [
            [3, 15, 3, 1, -1],
            [4, 15, 1, 1, 3],
          ],
          threshold: 0.000979799311608076,
          right_val: 0.1976581066846848,
          left_val: -0.0925702825188637,
        },
        {
          features: [
            [5, 14, 2, 1, -1],
            [6, 14, 1, 1, 2],
          ],
          threshold: 0.000014909260244166944,
          right_val: 0.1254208981990814,
          left_val: -0.1416793018579483,
        },
        {
          features: [
            [11, 9, 1, 2, -1],
            [11, 10, 1, 1, 2],
          ],
          threshold: -0.00021510709484573454,
          right_val: -0.0809787511825562,
          left_val: 0.2015448063611984,
        },
        {
          features: [
            [10, 12, 3, 1, -1],
            [11, 12, 1, 1, 3],
          ],
          threshold: -0.0013552160235121846,
          right_val: 0.0451370999217033,
          left_val: -0.3964821100234985,
        },
        {
          features: [
            [5, 9, 7, 2, -1],
            [5, 10, 7, 1, 2],
          ],
          threshold: 0.008416350930929184,
          right_val: 0.223276898264885,
          left_val: -0.0759626403450966,
        },
        {
          features: [
            [11, 0, 2, 1, -1],
            [12, 0, 1, 1, 2],
          ],
          threshold: -0.00030116800917312503,
          right_val: 0.0859178826212883,
          left_val: -0.1983765065670013,
        },
        {
          features: [
            [11, 0, 2, 2, -1],
            [12, 0, 1, 2, 2],
          ],
          threshold: 0.0009766537696123123,
          right_val: -0.3131501078605652,
          left_val: 0.061060719192028,
        },
        {
          features: [
            [5, 0, 2, 2, -1],
            [5, 0, 1, 1, 2],
            [6, 1, 1, 1, 2],
          ],
          threshold: 0.001971811056137085,
          right_val: 0.3293100893497467,
          left_val: -0.0541248805820942,
        },
        {
          features: [
            [8, 3, 12, 6, -1],
            [8, 5, 12, 2, 3],
          ],
          threshold: 0.0642203763127327,
          right_val: -0.5833930969238281,
          left_val: 0.0310349203646183,
        },
        {
          features: [
            [17, 0, 3, 12, -1],
            [18, 0, 1, 12, 3],
          ],
          threshold: -0.004885219037532806,
          right_val: -0.0854924321174622,
          left_val: 0.1866690963506699,
        },
        {
          features: [
            [11, 1, 2, 1, -1],
            [12, 1, 1, 1, 2],
          ],
          threshold: -0.0002530908095650375,
          right_val: 0.0924723818898201,
          left_val: -0.1657499969005585,
        },
        {
          features: [
            [5, 5, 2, 1, -1],
            [6, 5, 1, 1, 2],
          ],
          threshold: 0.000029818940674886107,
          right_val: 0.1015437990427017,
          left_val: -0.1419505029916763,
        },
        {
          features: [
            [7, 14, 6, 6, -1],
            [7, 14, 3, 3, 2],
            [10, 17, 3, 3, 2],
          ],
          threshold: -0.0102887600660324,
          right_val: -0.0592866614460945,
          left_val: 0.2513369917869568,
        },
        {
          features: [
            [11, 10, 1, 2, -1],
            [11, 11, 1, 1, 2],
          ],
          threshold: -0.000029165179512347095,
          right_val: -0.1173385009169579,
          left_val: 0.1295766979455948,
        },
        {
          features: [
            [3, 9, 12, 4, -1],
            [3, 9, 6, 2, 2],
            [9, 11, 6, 2, 2],
          ],
          threshold: -0.0020741471089422703,
          right_val: 0.0667929425835609,
          left_val: -0.2263393998146057,
        },
        {
          features: [
            [5, 10, 1, 2, -1],
            [5, 11, 1, 1, 2],
          ],
          threshold: 0.0011343799997121096,
          right_val: 0.2795625030994415,
          left_val: -0.0639137029647827,
        },
        {
          features: [
            [6, 10, 2, 1, -1],
            [7, 10, 1, 1, 2],
          ],
          threshold: -0.000015007710317149758,
          right_val: -0.1170506030321121,
          left_val: 0.1345475018024445,
        },
        {
          features: [
            [8, 16, 3, 2, -1],
            [9, 16, 1, 2, 3],
          ],
          threshold: 0.004982678219676018,
          right_val: -0.6001067161560059,
          left_val: 0.026505010202527,
        },
        {
          features: [
            [5, 10, 1, 3, -1],
            [5, 11, 1, 1, 3],
          ],
          threshold: -0.0034576859325170517,
          right_val: -0.054155170917511,
          left_val: 0.3128620982170105,
        },
        {
          features: [
            [7, 15, 3, 2, -1],
            [8, 15, 1, 2, 3],
          ],
          threshold: 0.005434482824057341,
          right_val: -0.5682408213615417,
          left_val: 0.0287027508020401,
        },
        {
          features: [
            [8, 15, 2, 1, -1],
            [9, 15, 1, 1, 2],
          ],
          threshold: -0.00001455804977013031,
          right_val: -0.1312769949436188,
          left_val: 0.1075678020715714,
        },
        {
          features: [
            [5, 10, 4, 3, -1],
            [5, 11, 4, 1, 3],
          ],
          threshold: 0.0015321969985961914,
          right_val: 0.1402143985033035,
          left_val: -0.1191162019968033,
        },
        {
          features: [
            [6, 7, 4, 12, -1],
            [8, 7, 2, 12, 2],
          ],
          threshold: -0.0224494300782681,
          right_val: 0.0493732206523418,
          left_val: -0.3337636888027191,
        },
        {
          features: [
            [5, 6, 6, 7, -1],
            [8, 6, 3, 7, 2],
          ],
          threshold: 0.0119230300188065,
          right_val: -0.2474693059921265,
          left_val: 0.0635587424039841,
        },
        {
          features: [
            [8, 4, 6, 11, -1],
            [11, 4, 3, 11, 2],
          ],
          threshold: 0.020685950294137,
          right_val: 0.2636730074882507,
          left_val: -0.0619051195681095,
        },
        {
          features: [
            [7, 9, 6, 3, -1],
            [9, 9, 2, 3, 3],
          ],
          threshold: 0.0005075677763670683,
          right_val: 0.1450580060482025,
          left_val: -0.1252831965684891,
        },
        {
          features: [
            [0, 5, 1, 2, -1],
            [0, 6, 1, 1, 2],
          ],
          threshold: 0.0009250853909179568,
          right_val: -0.2620438039302826,
          left_val: 0.0590095892548561,
        },
        {
          features: [
            [6, 8, 3, 1, -1],
            [7, 8, 1, 1, 3],
          ],
          threshold: 0.000866947986651212,
          right_val: 0.1779575049877167,
          left_val: -0.0889427214860916,
        },
        {
          features: [
            [12, 1, 2, 2, -1],
            [13, 1, 1, 2, 2],
          ],
          threshold: 0.00047340960009023547,
          right_val: -0.2188030034303665,
          left_val: 0.0681376308202744,
        },
        {
          features: [
            [4, 4, 10, 12, -1],
            [4, 4, 5, 6, 2],
            [9, 10, 5, 6, 2],
          ],
          threshold: 0.0903666019439697,
          right_val: -0.6573687195777893,
          left_val: 0.0185164697468281,
        },
        {
          features: [
            [5, 18, 2, 2, -1],
            [5, 18, 1, 1, 2],
            [6, 19, 1, 1, 2],
          ],
          threshold: 0.002058593090623617,
          right_val: 0.3287942111492157,
          left_val: -0.0455689989030361,
        },
        {
          features: [
            [6, 3, 3, 3, -1],
            [7, 3, 1, 3, 3],
          ],
          threshold: -0.0040761628188192844,
          right_val: 0.040903490036726,
          left_val: -0.3589670956134796,
        },
        {
          features: [
            [5, 12, 2, 3, -1],
            [5, 13, 2, 1, 3],
          ],
          threshold: 0.0032309619709849358,
          right_val: 0.2551850974559784,
          left_val: -0.0587724708020687,
        },
        {
          features: [
            [11, 15, 2, 3, -1],
            [11, 16, 2, 1, 3],
          ],
          threshold: 0.0020424150861799717,
          right_val: -0.3339330852031708,
          left_val: 0.0432094410061836,
        },
        {
          features: [
            [11, 15, 1, 3, -1],
            [11, 16, 1, 1, 3],
          ],
          threshold: -0.0002834172919392586,
          right_val: 0.0815553367137909,
          left_val: -0.1668505966663361,
        },
        {
          features: [
            [6, 7, 3, 2, -1],
            [7, 7, 1, 2, 3],
          ],
          threshold: -0.0010859699686989188,
          right_val: -0.092171236872673,
          left_val: 0.1780744940042496,
        },
        {
          features: [
            [3, 11, 14, 1, -1],
            [10, 11, 7, 1, 2],
          ],
          threshold: -0.0200895201414824,
          right_val: 0.0446077510714531,
          left_val: -0.3523639142513275,
        },
        {
          features: [
            [5, 7, 3, 1, -1],
            [6, 7, 1, 1, 3],
          ],
          threshold: -0.0018073120154440403,
          right_val: -0.0520475804805756,
          left_val: 0.3022094070911408,
        },
        {
          features: [
            [14, 9, 3, 3, -1],
            [14, 10, 3, 1, 3],
          ],
          threshold: 0.0103371497243643,
          right_val: -0.6883816123008728,
          left_val: 0.0247871391475201,
        },
        {
          features: [
            [4, 17, 2, 2, -1],
            [4, 17, 1, 1, 2],
            [5, 18, 1, 1, 2],
          ],
          threshold: -0.0024023749865591526,
          right_val: -0.0461994893848896,
          left_val: 0.3317334055900574,
        },
        {
          features: [
            [15, 16, 2, 2, -1],
            [15, 17, 2, 1, 2],
          ],
          threshold: -0.0005834709736518562,
          right_val: 0.0773477926850319,
          left_val: -0.1885682046413422,
        },
        {
          features: [
            [18, 12, 2, 2, -1],
            [18, 12, 1, 1, 2],
            [19, 13, 1, 1, 2],
          ],
          threshold: -0.002175921108573675,
          right_val: -0.0408558696508408,
          left_val: 0.330673485994339,
        },
        {
          features: [
            [5, 11, 4, 3, -1],
            [7, 11, 2, 3, 2],
          ],
          threshold: -0.0011984390439465642,
          right_val: 0.0685345828533173,
          left_val: -0.215803399682045,
        },
        {
          features: [
            [9, 7, 2, 3, -1],
            [9, 8, 2, 1, 3],
          ],
          threshold: 0.0014474330237135291,
          right_val: 0.2336236983537674,
          left_val: -0.0580749288201332,
        },
        {
          features: [
            [18, 6, 2, 2, -1],
            [18, 7, 2, 1, 2],
          ],
          threshold: 0.0005162584129720926,
          right_val: -0.2095647007226944,
          left_val: 0.0756555795669556,
        },
        {
          features: [
            [18, 6, 2, 2, -1],
            [18, 7, 2, 1, 2],
          ],
          threshold: -0.0014388939598575234,
          right_val: 0.0581599995493889,
          left_val: -0.3094814121723175,
        },
        {
          features: [
            [4, 5, 2, 6, -1],
            [4, 7, 2, 2, 3],
          ],
          threshold: -0.0017495449865236878,
          right_val: -0.1571523994207382,
          left_val: 0.1023629009723663,
        },
        {
          features: [
            [3, 11, 6, 4, -1],
            [3, 11, 3, 2, 2],
            [6, 13, 3, 2, 2],
          ],
          threshold: 0.0167749393731356,
          right_val: -0.585945725440979,
          left_val: 0.0237116999924183,
        },
        {
          features: [
            [1, 10, 3, 3, -1],
            [2, 10, 1, 3, 3],
          ],
          threshold: -0.008326519280672073,
          right_val: -0.0488075613975525,
          left_val: 0.3094334900379181,
        },
        {
          features: [
            [15, 0, 4, 4, -1],
            [15, 0, 2, 2, 2],
            [17, 2, 2, 2, 2],
          ],
          threshold: -0.00004485315002966672,
          right_val: -0.1308971047401428,
          left_val: 0.1061550974845886,
        },
        {
          features: [
            [5, 6, 4, 10, -1],
            [5, 11, 4, 5, 2],
          ],
          threshold: 0.005990826990455389,
          right_val: -0.1681780964136124,
          left_val: 0.0801688730716705,
        },
        {
          features: [
            [7, 13, 1, 3, -1],
            [7, 14, 1, 1, 3],
          ],
          threshold: 0.0014110070187598467,
          right_val: 0.2204508036375046,
          left_val: -0.0699415877461433,
        },
        {
          features: [
            [3, 10, 16, 4, -1],
            [3, 10, 8, 2, 2],
            [11, 12, 8, 2, 2],
          ],
          threshold: 0.0412059985101223,
          right_val: -0.4417685866355896,
          left_val: 0.0317214317619801,
        },
        {
          features: [
            [7, 14, 1, 3, -1],
            [7, 15, 1, 1, 3],
          ],
          threshold: 0.00015044870087876916,
          right_val: 0.1124142035841942,
          left_val: -0.1215230002999306,
        },
        {
          features: [
            [5, 14, 3, 3, -1],
            [5, 15, 3, 1, 3],
          ],
          threshold: -0.004839953035116196,
          right_val: -0.051606610417366,
          left_val: 0.2824499905109406,
        },
        {
          features: [
            [9, 9, 3, 8, -1],
            [10, 9, 1, 8, 3],
          ],
          threshold: -0.0010831269901245832,
          right_val: 0.083731047809124,
          left_val: -0.1697801947593689,
        },
        {
          features: [
            [6, 0, 7, 4, -1],
            [6, 2, 7, 2, 2],
          ],
          threshold: -0.0134832002222538,
          right_val: -0.0522285997867584,
          left_val: 0.2826932072639465,
        },
        {
          features: [
            [8, 0, 1, 4, -1],
            [8, 2, 1, 2, 2],
          ],
          threshold: 0.0005985464085824788,
          right_val: 0.1228089034557343,
          left_val: -0.1374914944171906,
        },
        {
          features: [
            [1, 4, 1, 6, -1],
            [1, 6, 1, 2, 3],
          ],
          threshold: -0.000649433524813503,
          right_val: 0.0881716907024384,
          left_val: -0.1693159937858582,
        },
        {
          features: [
            [0, 2, 15, 3, -1],
            [5, 2, 5, 3, 3],
          ],
          threshold: -0.006319115869700909,
          right_val: -0.0863000601530075,
          left_val: 0.1624546051025391,
        },
        {
          features: [
            [0, 8, 2, 2, -1],
            [0, 9, 2, 1, 2],
          ],
          threshold: -0.0025179239455610514,
          right_val: 0.0526881888508797,
          left_val: -0.3185339868068695,
        },
        {
          features: [
            [3, 10, 6, 4, -1],
            [5, 10, 2, 4, 3],
          ],
          threshold: -0.0469249710440636,
          right_val: 0.0205050799995661,
          left_val: -0.6577314138412476,
        },
        {
          features: [
            [8, 5, 3, 1, -1],
            [9, 5, 1, 1, 3],
          ],
          threshold: -0.0009644642123021185,
          right_val: 0.0454412996768951,
          left_val: -0.2725659906864166,
        },
        {
          features: [
            [15, 11, 2, 2, -1],
            [15, 11, 1, 1, 2],
            [16, 12, 1, 1, 2],
          ],
          threshold: 0.001507309963926673,
          right_val: 0.2848648130893707,
          left_val: -0.0504794605076313,
        },
        {
          features: [
            [4, 11, 6, 2, -1],
            [7, 11, 3, 2, 2],
          ],
          threshold: 0.0161499306559563,
          right_val: -0.361495703458786,
          left_val: 0.0387690588831902,
        },
        {
          features: [
            [6, 8, 6, 4, -1],
            [8, 8, 2, 4, 3],
          ],
          threshold: 0.0191265102475882,
          right_val: 0.4757354855537415,
          left_val: -0.0362336412072182,
        },
        {
          features: [
            [6, 5, 6, 6, -1],
            [8, 5, 2, 6, 3],
          ],
          threshold: -0.0012546279467642307,
          right_val: -0.155541405081749,
          left_val: 0.1100990995764732,
        },
        {
          features: [
            [14, 12, 2, 3, -1],
            [15, 12, 1, 3, 2],
          ],
          threshold: -0.00001475452972954372,
          right_val: -0.1394743025302887,
          left_val: 0.0965491533279419,
        },
        {
          features: [
            [11, 5, 3, 7, -1],
            [12, 5, 1, 7, 3],
          ],
          threshold: 0.0156801696866751,
          right_val: -0.5771318078041077,
          left_val: 0.0232145208865404,
        },
        {
          features: [
            [7, 16, 8, 4, -1],
            [7, 16, 4, 2, 2],
            [11, 18, 4, 2, 2],
          ],
          threshold: 0.012293360196054,
          right_val: 0.2395139038562775,
          left_val: -0.0578098893165588,
        },
        {
          features: [
            [5, 16, 12, 4, -1],
            [5, 16, 6, 2, 2],
            [11, 18, 6, 2, 2],
          ],
          threshold: -0.009659625589847565,
          right_val: -0.065823532640934,
          left_val: 0.2409874051809311,
        },
        {
          features: [
            [10, 17, 6, 3, -1],
            [10, 18, 6, 1, 3],
          ],
          threshold: 0.004494008142501116,
          right_val: -0.3147468864917755,
          left_val: 0.054532490670681,
        },
        {
          features: [
            [6, 8, 2, 3, -1],
            [6, 9, 2, 1, 3],
          ],
          threshold: 0.0114805800840259,
          right_val: -0.7472283244132996,
          left_val: 0.0174192991107702,
        },
        {
          features: [
            [0, 0, 20, 18, -1],
            [10, 0, 10, 18, 2],
          ],
          threshold: -0.654996395111084,
          right_val: 0.0261871200054884,
          left_val: -0.4548397064208984,
        },
        {
          features: [
            [8, 0, 6, 5, -1],
            [11, 0, 3, 5, 2],
          ],
          threshold: -0.0001574691996211186,
          right_val: -0.182403102517128,
          left_val: 0.0843414589762688,
        },
        {
          features: [
            [13, 5, 4, 2, -1],
            [13, 5, 2, 1, 2],
            [15, 6, 2, 1, 2],
          ],
          threshold: -0.001011190004646778,
          right_val: 0.0676762163639069,
          left_val: -0.2086289972066879,
        },
        {
          features: [
            [10, 4, 4, 11, -1],
            [12, 4, 2, 11, 2],
          ],
          threshold: 0.0184888392686844,
          right_val: 0.4134215116500855,
          left_val: -0.0354996211826801,
        },
        {
          features: [
            [5, 10, 3, 1, -1],
            [6, 10, 1, 1, 3],
          ],
          threshold: -0.0003888891078531742,
          right_val: -0.0862994790077209,
          left_val: 0.1569246053695679,
        },
        {
          features: [
            [17, 4, 2, 3, -1],
            [17, 5, 2, 1, 3],
          ],
          threshold: -0.004531530197709799,
          right_val: 0.0341036207973957,
          left_val: -0.4391221106052399,
        },
        {
          features: [
            [6, 13, 8, 6, -1],
            [6, 13, 4, 3, 2],
            [10, 16, 4, 3, 2],
          ],
          threshold: 0.0335360206663609,
          right_val: 0.470965713262558,
          left_val: -0.0322315283119679,
        },
        {
          features: [
            [17, 5, 3, 10, -1],
            [18, 5, 1, 10, 3],
          ],
          threshold: 0.0020854349713772535,
          right_val: 0.1737388074398041,
          left_val: -0.0760010108351707,
        },
        {
          features: [
            [13, 11, 2, 2, -1],
            [14, 11, 1, 2, 2],
          ],
          threshold: -0.000014060589819564484,
          right_val: -0.1634878069162369,
          left_val: 0.0859609991312027,
        },
        {
          features: [
            [5, 9, 4, 9, -1],
            [5, 12, 4, 3, 3],
          ],
          threshold: 0.0429956801235676,
          right_val: -0.592742919921875,
          left_val: 0.0220331195741892,
        },
        {
          features: [
            [5, 11, 2, 3, -1],
            [5, 12, 2, 1, 3],
          ],
          threshold: 0.0024928380735218525,
          right_val: 0.2139886021614075,
          left_val: -0.0630207732319832,
        },
        {
          features: [
            [15, 15, 2, 2, -1],
            [15, 15, 1, 1, 2],
            [16, 16, 1, 1, 2],
          ],
          threshold: 0.000014520809600071516,
          right_val: 0.1199731975793839,
          left_val: -0.1121812984347343,
        },
        {
          features: [
            [6, 13, 6, 5, -1],
            [8, 13, 2, 5, 3],
          ],
          threshold: 0.0211523603647947,
          right_val: -0.4460080862045288,
          left_val: 0.0302707105875015,
        },
        {
          features: [
            [9, 7, 2, 8, -1],
            [9, 7, 1, 4, 2],
            [10, 11, 1, 4, 2],
          ],
          threshold: 0.0002102878934238106,
          right_val: -0.1720902025699616,
          left_val: 0.0803844183683395,
        },
        {
          features: [
            [4, 12, 2, 2, -1],
            [4, 12, 1, 1, 2],
            [5, 13, 1, 1, 2],
          ],
          threshold: 0.0010620340472087264,
          right_val: 0.2130492031574249,
          left_val: -0.0640519708395004,
        },
        {
          features: [
            [7, 4, 3, 1, -1],
            [8, 4, 1, 1, 3],
          ],
          threshold: -0.0025768030900508165,
          right_val: 0.0261464696377516,
          left_val: -0.5230960249900818,
        },
        {
          features: [
            [12, 3, 3, 4, -1],
            [13, 3, 1, 4, 3],
          ],
          threshold: 0.004755557980388403,
          right_val: -0.3440873026847839,
          left_val: 0.0362137295305729,
        },
        {
          features: [
            [2, 0, 18, 20, -1],
            [2, 10, 18, 10, 2],
          ],
          threshold: -0.5906254053115845,
          right_val: 0.0134163796901703,
          left_val: -0.9170126914978027,
        },
        {
          features: [
            [11, 2, 7, 12, -1],
            [11, 8, 7, 6, 2],
          ],
          threshold: -0.097031831741333,
          right_val: -0.0323441810905933,
          left_val: 0.4828839898109436,
        },
        {
          features: [
            [13, 5, 2, 2, -1],
            [14, 5, 1, 2, 2],
          ],
          threshold: 0.001489015994593501,
          right_val: -0.388984888792038,
          left_val: 0.0405917502939701,
        },
        {
          features: [
            [4, 17, 4, 1, -1],
            [6, 17, 2, 1, 2],
          ],
          threshold: 0.0024702500086277723,
          right_val: 0.2132260948419571,
          left_val: -0.0631592199206352,
        },
        {
          features: [
            [3, 14, 4, 4, -1],
            [5, 14, 2, 4, 2],
          ],
          threshold: -0.002970529953017831,
          right_val: -0.1018164977431297,
          left_val: 0.1496088951826096,
        },
        {
          features: [
            [0, 2, 8, 18, -1],
            [0, 11, 8, 9, 2],
          ],
          threshold: 0.1555549949407578,
          right_val: -0.3598398864269257,
          left_val: 0.0366748794913292,
        },
        {
          features: [
            [5, 7, 3, 3, -1],
            [5, 8, 3, 1, 3],
          ],
          threshold: 0.0141136599704623,
          right_val: -0.87112957239151,
          left_val: 0.0138346403837204,
        },
        {
          features: [
            [8, 2, 3, 2, -1],
            [9, 2, 1, 2, 3],
          ],
          threshold: -0.0009559412719681859,
          right_val: 0.055646751075983,
          left_val: -0.2235932946205139,
        },
      ],
      threshold: -1.4499469995498657,
    },
    {
      simpleClassifiers: [
        {
          features: [
            [5, 7, 15, 4, -1],
            [5, 9, 15, 2, 2],
          ],
          threshold: 0.0230683200061321,
          right_val: 0.2575811147689819,
          left_val: -0.3073453903198242,
        },
        {
          features: [
            [10, 0, 10, 8, -1],
            [10, 0, 5, 4, 2],
            [15, 4, 5, 4, 2],
          ],
          threshold: -0.0116030303761363,
          right_val: -0.2991755902767181,
          left_val: 0.1734793931245804,
        },
        {
          features: [
            [10, 8, 4, 4, -1],
            [10, 8, 2, 2, 2],
            [12, 10, 2, 2, 2],
          ],
          threshold: -0.0010232869535684586,
          right_val: -0.2492682933807373,
          left_val: 0.1928901970386505,
        },
        {
          features: [
            [5, 6, 3, 10, -1],
            [5, 11, 3, 5, 2],
          ],
          threshold: 0.0121949603781104,
          right_val: -0.4085389077663422,
          left_val: 0.0875914171338081,
        },
        {
          features: [
            [7, 6, 3, 4, -1],
            [8, 6, 1, 4, 3],
          ],
          threshold: -0.0012484550243243575,
          right_val: -0.1881189942359924,
          left_val: 0.1634556949138641,
        },
        {
          features: [
            [12, 13, 2, 2, -1],
            [12, 14, 2, 1, 2],
          ],
          threshold: 0.0003214546013623476,
          right_val: -0.3772250115871429,
          left_val: 0.0791359096765518,
        },
        {
          features: [
            [7, 8, 4, 12, -1],
            [7, 12, 4, 4, 3],
          ],
          threshold: -0.0007970778970047832,
          right_val: 0.0969362631440163,
          left_val: -0.2637738883495331,
        },
        {
          features: [
            [0, 0, 6, 18, -1],
            [2, 0, 2, 18, 3],
          ],
          threshold: 0.0709249228239059,
          right_val: 0.2526729106903076,
          left_val: -0.1253806054592133,
        },
        {
          features: [
            [6, 1, 10, 6, -1],
            [6, 3, 10, 2, 3],
          ],
          threshold: 0.0025408361107110977,
          right_val: 0.1497431993484497,
          left_val: -0.1392325013875961,
        },
        {
          features: [
            [13, 9, 3, 2, -1],
            [13, 10, 3, 1, 2],
          ],
          threshold: -0.0006925389170646667,
          right_val: 0.0394197404384613,
          left_val: -0.3136391937732697,
        },
        {
          features: [
            [5, 10, 1, 3, -1],
            [5, 11, 1, 1, 3],
          ],
          threshold: 0.002584564033895731,
          right_val: 0.2809658050537109,
          left_val: -0.0700671225786209,
        },
        {
          features: [
            [6, 10, 1, 10, -1],
            [6, 15, 1, 5, 2],
          ],
          threshold: -0.0168039500713348,
          right_val: 0.0365094691514969,
          left_val: -0.4625408053398132,
        },
        {
          features: [
            [9, 9, 3, 4, -1],
            [9, 11, 3, 2, 2],
          ],
          threshold: -0.002133260015398264,
          right_val: -0.084447480738163,
          left_val: 0.2269130945205689,
        },
        {
          features: [
            [7, 4, 2, 2, -1],
            [7, 5, 2, 1, 2],
          ],
          threshold: -0.0005539713893085718,
          right_val: 0.1004170030355454,
          left_val: -0.2072816044092178,
        },
        {
          features: [
            [12, 12, 2, 1, -1],
            [13, 12, 1, 1, 2],
          ],
          threshold: -0.000014573110092896968,
          right_val: -0.2081342041492462,
          left_val: 0.088534340262413,
        },
        {
          features: [
            [7, 12, 1, 3, -1],
            [7, 13, 1, 1, 3],
          ],
          threshold: 0.0008028150768950582,
          right_val: 0.1955396980047226,
          left_val: -0.0885214433073998,
        },
        {
          features: [
            [5, 11, 3, 3, -1],
            [5, 12, 3, 1, 3],
          ],
          threshold: 0.0036762449890375137,
          right_val: 0.2423270046710968,
          left_val: -0.0839662775397301,
        },
        {
          features: [
            [1, 0, 1, 2, -1],
            [1, 1, 1, 1, 2],
          ],
          threshold: -0.0001654957013670355,
          right_val: 0.1004450991749764,
          left_val: -0.194020003080368,
        },
        {
          features: [
            [10, 16, 6, 3, -1],
            [10, 17, 6, 1, 3],
          ],
          threshold: 0.005522578954696655,
          right_val: -0.4109568893909454,
          left_val: 0.0460141412913799,
        },
        {
          features: [
            [9, 4, 4, 6, -1],
            [9, 4, 2, 3, 2],
            [11, 7, 2, 3, 2],
          ],
          threshold: 0.0011023939587175846,
          right_val: 0.084169827401638,
          left_val: -0.2105371952056885,
        },
        {
          features: [
            [10, 9, 10, 1, -1],
            [15, 9, 5, 1, 2],
          ],
          threshold: -0.0216103605926037,
          right_val: 0.0511969402432442,
          left_val: -0.3472487926483154,
        },
        {
          features: [
            [9, 11, 1, 2, -1],
            [9, 12, 1, 1, 2],
          ],
          threshold: -0.000014869699953123927,
          right_val: -0.1624923050403595,
          left_val: 0.1118715032935143,
        },
        {
          features: [
            [7, 8, 3, 6, -1],
            [7, 10, 3, 2, 3],
          ],
          threshold: 0.031727060675621,
          right_val: -0.4535711109638214,
          left_val: 0.0375460311770439,
        },
        {
          features: [
            [1, 18, 8, 2, -1],
            [1, 18, 4, 1, 2],
            [5, 19, 4, 1, 2],
          ],
          threshold: -0.006558817811310291,
          right_val: -0.0615393109619617,
          left_val: 0.2975679039955139,
        },
        {
          features: [
            [5, 13, 3, 3, -1],
            [5, 14, 3, 1, 3],
          ],
          threshold: 0.0037398359272629023,
          right_val: 0.2288192063570023,
          left_val: -0.0693628415465355,
        },
        {
          features: [
            [4, 6, 5, 6, -1],
            [4, 9, 5, 3, 2],
          ],
          threshold: -0.002144579077139497,
          right_val: 0.0570855401456356,
          left_val: -0.3069198131561279,
        },
        {
          features: [
            [6, 5, 2, 1, -1],
            [7, 5, 1, 1, 2],
          ],
          threshold: 0.0014241340104490519,
          right_val: -0.3514148890972138,
          left_val: 0.0477477200329304,
        },
        {
          features: [
            [11, 6, 1, 6, -1],
            [11, 9, 1, 3, 2],
          ],
          threshold: 0.0018902820302173495,
          right_val: -0.150749996304512,
          left_val: 0.1125065013766289,
        },
        {
          features: [
            [6, 17, 4, 3, -1],
            [6, 18, 4, 1, 3],
          ],
          threshold: -0.006491790059953928,
          right_val: -0.062573678791523,
          left_val: 0.2871277928352356,
        },
        {
          features: [
            [10, 4, 2, 10, -1],
            [10, 4, 1, 5, 2],
            [11, 9, 1, 5, 2],
          ],
          threshold: -0.008775000460445881,
          right_val: 0.0295595303177834,
          left_val: -0.5414124131202698,
        },
        {
          features: [
            [8, 4, 9, 13, -1],
            [11, 4, 3, 13, 3],
          ],
          threshold: 0.093647688627243,
          right_val: 0.296383798122406,
          left_val: -0.0569437891244888,
        },
        {
          features: [
            [10, 11, 2, 2, -1],
            [11, 11, 1, 2, 2],
          ],
          threshold: -0.00004402880949783139,
          right_val: -0.1516932994127274,
          left_val: 0.1072629019618034,
        },
        {
          features: [
            [13, 15, 1, 2, -1],
            [13, 16, 1, 1, 2],
          ],
          threshold: 0.00007969084254000336,
          right_val: -0.1815764009952545,
          left_val: 0.0877043381333351,
        },
        {
          features: [
            [17, 0, 3, 13, -1],
            [18, 0, 1, 13, 3],
          ],
          threshold: -0.006651044823229313,
          right_val: -0.0787653997540474,
          left_val: 0.2125076949596405,
        },
        {
          features: [
            [0, 0, 14, 10, -1],
            [0, 5, 14, 5, 2],
          ],
          threshold: 0.2135832011699677,
          right_val: -0.4989534914493561,
          left_val: 0.0327049307525158,
        },
        {
          features: [
            [12, 5, 6, 15, -1],
            [14, 5, 2, 15, 3],
          ],
          threshold: -0.0980354100465775,
          right_val: 0.0243007503449917,
          left_val: -0.6362007260322571,
        },
        {
          features: [
            [11, 10, 2, 3, -1],
            [11, 11, 2, 1, 3],
          ],
          threshold: -0.0036894609220325947,
          right_val: 0.0253432206809521,
          left_val: -0.5787317156791687,
        },
        {
          features: [
            [5, 14, 3, 3, -1],
            [5, 15, 3, 1, 3],
          ],
          threshold: 0.004786756820976734,
          right_val: 0.2464102953672409,
          left_val: -0.0697197988629341,
        },
        {
          features: [
            [5, 15, 3, 2, -1],
            [5, 16, 3, 1, 2],
          ],
          threshold: 0.0004025078087579459,
          right_val: 0.1716368943452835,
          left_val: -0.1185259968042374,
        },
        {
          features: [
            [11, 14, 3, 6, -1],
            [12, 14, 1, 6, 3],
          ],
          threshold: -0.003825803054496646,
          right_val: 0.0527966506779194,
          left_val: -0.3170871138572693,
        },
        {
          features: [
            [12, 18, 2, 1, -1],
            [13, 18, 1, 1, 2],
          ],
          threshold: 0.00002925509943452198,
          right_val: 0.1244350969791412,
          left_val: -0.1215787008404732,
        },
        {
          features: [
            [16, 5, 1, 2, -1],
            [16, 6, 1, 1, 2],
          ],
          threshold: -0.0005596922128461301,
          right_val: 0.0615640208125114,
          left_val: -0.2394244968891144,
        },
        {
          features: [
            [17, 8, 3, 4, -1],
            [18, 8, 1, 4, 3],
          ],
          threshold: 0.00161492801271379,
          right_val: 0.1939617991447449,
          left_val: -0.0895366817712784,
        },
        {
          features: [
            [8, 15, 2, 3, -1],
            [9, 15, 1, 3, 2],
          ],
          threshold: -0.005916575901210308,
          right_val: 0.024107500910759,
          left_val: -0.6074134707450867,
        },
        {
          features: [
            [6, 7, 2, 4, -1],
            [6, 7, 1, 2, 2],
            [7, 9, 1, 2, 2],
          ],
          threshold: 0.0045592039823532104,
          right_val: 0.2872112989425659,
          left_val: -0.0540901198983192,
        },
        {
          features: [
            [3, 7, 12, 2, -1],
            [7, 7, 4, 2, 3],
          ],
          threshold: -0.0517677888274193,
          right_val: 0.024329099804163,
          left_val: -0.6485347151756287,
        },
        {
          features: [
            [4, 7, 3, 3, -1],
            [5, 7, 1, 3, 3],
          ],
          threshold: -0.010635569691658,
          right_val: -0.0502317883074284,
          left_val: 0.3235976099967957,
        },
        {
          features: [
            [1, 10, 2, 1, -1],
            [2, 10, 1, 1, 2],
          ],
          threshold: 0.0002512111095711589,
          right_val: -0.1485994011163712,
          left_val: 0.0952744483947754,
        },
        {
          features: [
            [4, 4, 2, 5, -1],
            [5, 4, 1, 5, 2],
          ],
          threshold: 0.0013107099803164601,
          right_val: 0.1264725029468536,
          left_val: -0.1161269024014473,
        },
        {
          features: [
            [6, 7, 14, 2, -1],
            [13, 7, 7, 2, 2],
          ],
          threshold: -0.0736297219991684,
          right_val: 0.0241974107921124,
          left_val: -0.6297783255577087,
        },
        {
          features: [
            [14, 17, 2, 3, -1],
            [14, 18, 2, 1, 3],
          ],
          threshold: 0.0005186453927308321,
          right_val: -0.1803835034370422,
          left_val: 0.0808439701795578,
        },
        {
          features: [
            [6, 11, 1, 3, -1],
            [6, 12, 1, 1, 3],
          ],
          threshold: -0.002054109936580062,
          right_val: -0.0715596377849579,
          left_val: 0.2069077044725418,
        },
        {
          features: [
            [11, 3, 8, 16, -1],
            [11, 11, 8, 8, 2],
          ],
          threshold: -0.00727385189384222,
          right_val: 0.0846181586384773,
          left_val: -0.1804922074079514,
        },
        {
          features: [
            [9, 12, 5, 3, -1],
            [9, 13, 5, 1, 3],
          ],
          threshold: -0.007041871082037687,
          right_val: 0.0242430008947849,
          left_val: -0.5525584816932678,
        },
        {
          features: [
            [5, 9, 1, 3, -1],
            [5, 10, 1, 1, 3],
          ],
          threshold: 0.0023678881116211414,
          right_val: 0.2201319932937622,
          left_val: -0.0743150636553764,
        },
        {
          features: [
            [3, 8, 8, 4, -1],
            [3, 8, 4, 2, 2],
            [7, 10, 4, 2, 2],
          ],
          threshold: -0.004134140908718109,
          right_val: 0.0576455406844616,
          left_val: -0.3146111071109772,
        },
        {
          features: [
            [10, 15, 2, 3, -1],
            [10, 16, 2, 1, 3],
          ],
          threshold: 0.005959763191640377,
          right_val: -0.6639922261238098,
          left_val: 0.0215512104332447,
        },
        {
          features: [
            [14, 9, 1, 6, -1],
            [14, 12, 1, 3, 2],
          ],
          threshold: -0.000014643320355389733,
          right_val: -0.1437864005565643,
          left_val: 0.103253997862339,
        },
        {
          features: [
            [13, 11, 1, 3, -1],
            [13, 12, 1, 1, 3],
          ],
          threshold: -0.0008032406913116574,
          right_val: 0.0521755404770374,
          left_val: -0.2802684903144836,
        },
        {
          features: [
            [8, 7, 6, 6, -1],
            [8, 9, 6, 2, 3],
          ],
          threshold: -0.0178602207452059,
          right_val: -0.047295480966568,
          left_val: 0.3154763877391815,
        },
        {
          features: [
            [9, 8, 4, 3, -1],
            [9, 9, 4, 1, 3],
          ],
          threshold: 0.0008522971183992922,
          right_val: 0.1690572947263718,
          left_val: -0.1086079031229019,
        },
        {
          features: [
            [8, 2, 2, 5, -1],
            [9, 2, 1, 5, 2],
          ],
          threshold: 0.008861834183335304,
          right_val: -0.716867983341217,
          left_val: 0.020629420876503,
        },
        {
          features: [
            [13, 6, 3, 3, -1],
            [13, 7, 3, 1, 3],
          ],
          threshold: 0.004141862038522959,
          right_val: -0.3975364863872528,
          left_val: 0.0313132107257843,
        },
        {
          features: [
            [12, 0, 5, 14, -1],
            [12, 7, 5, 7, 2],
          ],
          threshold: -0.0966165810823441,
          right_val: -0.0322910994291306,
          left_val: 0.423788994550705,
        },
        {
          features: [
            [2, 2, 7, 10, -1],
            [2, 7, 7, 5, 2],
          ],
          threshold: -0.0848536491394043,
          right_val: 0.0344205088913441,
          left_val: -0.4836021065711975,
        },
        {
          features: [
            [5, 5, 6, 11, -1],
            [8, 5, 3, 11, 2],
          ],
          threshold: -0.0273994896560907,
          right_val: 0.0468055084347725,
          left_val: -0.2898151874542236,
        },
        {
          features: [
            [6, 17, 3, 3, -1],
            [6, 18, 3, 1, 3],
          ],
          threshold: 0.001965342089533806,
          right_val: 0.1889424026012421,
          left_val: -0.0762211307883263,
        },
        {
          features: [
            [9, 5, 2, 8, -1],
            [9, 5, 1, 4, 2],
            [10, 9, 1, 4, 2],
          ],
          threshold: -0.009022274985909462,
          right_val: 0.0260387808084488,
          left_val: -0.582550585269928,
        },
        {
          features: [
            [14, 0, 4, 16, -1],
            [14, 8, 4, 8, 2],
          ],
          threshold: 0.1785901039838791,
          right_val: -0.7587677240371704,
          left_val: 0.0141130797564983,
        },
        {
          features: [
            [10, 7, 1, 3, -1],
            [10, 8, 1, 1, 3],
          ],
          threshold: 0.002617086051031947,
          right_val: 0.3458263874053955,
          left_val: -0.0420114099979401,
        },
        {
          features: [
            [7, 16, 3, 2, -1],
            [8, 16, 1, 2, 3],
          ],
          threshold: -0.0018247140105813742,
          right_val: 0.0541134513914585,
          left_val: -0.2512575089931488,
        },
        {
          features: [
            [10, 6, 1, 3, -1],
            [10, 7, 1, 1, 3],
          ],
          threshold: 0.0010635840008035302,
          right_val: 0.2111109048128128,
          left_val: -0.0699880570173264,
        },
        {
          features: [
            [5, 11, 14, 6, -1],
            [5, 14, 14, 3, 2],
          ],
          threshold: -0.0857941210269928,
          right_val: 0.0242343097925186,
          left_val: -0.5295022130012512,
        },
        {
          features: [
            [9, 6, 1, 3, -1],
            [9, 7, 1, 1, 3],
          ],
          threshold: -0.0024844249710440636,
          right_val: -0.057894941419363,
          left_val: 0.2279888987541199,
        },
        {
          features: [
            [6, 11, 5, 4, -1],
            [6, 13, 5, 2, 2],
          ],
          threshold: 0.002451739041134715,
          right_val: -0.2993184030056,
          left_val: 0.0477582700550556,
        },
        {
          features: [
            [6, 9, 10, 8, -1],
            [6, 9, 5, 4, 2],
            [11, 13, 5, 4, 2],
          ],
          threshold: 0.007208813913166523,
          right_val: -0.146636500954628,
          left_val: 0.0891904607415199,
        },
        {
          features: [
            [18, 9, 2, 6, -1],
            [18, 9, 1, 3, 2],
            [19, 12, 1, 3, 2],
          ],
          threshold: -0.006072841119021177,
          right_val: -0.0441877916455269,
          left_val: 0.2977311015129089,
        },
        {
          features: [
            [5, 12, 8, 2, -1],
            [9, 12, 4, 2, 2],
          ],
          threshold: 0.0293797198683023,
          right_val: -0.7279959917068481,
          left_val: 0.0183849204331636,
        },
        {
          features: [
            [8, 8, 6, 12, -1],
            [8, 8, 3, 6, 2],
            [11, 14, 3, 6, 2],
          ],
          threshold: 0.0352654606103897,
          right_val: 0.3436934947967529,
          left_val: -0.0403451286256313,
        },
        {
          features: [
            [12, 7, 3, 5, -1],
            [13, 7, 1, 5, 3],
          ],
          threshold: 0.0008066808804869652,
          right_val: 0.1332406997680664,
          left_val: -0.1017149016261101,
        },
        {
          features: [
            [10, 13, 4, 3, -1],
            [10, 14, 4, 1, 3],
          ],
          threshold: -0.0014964640140533447,
          right_val: 0.059193279594183,
          left_val: -0.2329643964767456,
        },
        {
          features: [
            [12, 4, 3, 15, -1],
            [13, 4, 1, 15, 3],
          ],
          threshold: 0.0261369794607162,
          right_val: -0.7309460043907166,
          left_val: 0.0179935190826654,
        },
        {
          features: [
            [4, 12, 4, 2, -1],
            [6, 12, 2, 2, 2],
          ],
          threshold: 0.0186632592231035,
          right_val: -0.721051812171936,
          left_val: 0.0146938003599644,
        },
        {
          features: [
            [14, 1, 6, 1, -1],
            [16, 1, 2, 1, 3],
          ],
          threshold: -0.00005094443986308761,
          right_val: -0.1348700970411301,
          left_val: 0.0981138125061989,
        },
        {
          features: [
            [15, 3, 2, 8, -1],
            [16, 3, 1, 8, 2],
          ],
          threshold: -0.0005526802851818502,
          right_val: 0.1193132027983666,
          left_val: -0.1131390035152435,
        },
        {
          features: [
            [13, 16, 6, 4, -1],
            [13, 16, 3, 2, 2],
            [16, 18, 3, 2, 2],
          ],
          threshold: 0.005491612013429403,
          right_val: 0.2231263071298599,
          left_val: -0.0689969286322594,
        },
        {
          features: [
            [9, 5, 6, 7, -1],
            [12, 5, 3, 7, 2],
          ],
          threshold: 0.0312431994825602,
          right_val: 0.3925015032291412,
          left_val: -0.0323944389820099,
        },
        {
          features: [
            [18, 3, 2, 2, -1],
            [18, 4, 2, 1, 2],
          ],
          threshold: 0.002737544011324644,
          right_val: -0.4063234925270081,
          left_val: 0.0367135107517242,
        },
        {
          features: [
            [2, 0, 18, 4, -1],
            [11, 0, 9, 4, 2],
          ],
          threshold: 0.0909608900547028,
          right_val: -0.4161289930343628,
          left_val: 0.027709199115634,
        },
        {
          features: [
            [0, 8, 2, 2, -1],
            [1, 8, 1, 2, 2],
          ],
          threshold: -0.00042210621177218854,
          right_val: 0.0784403532743454,
          left_val: -0.1599356979131699,
        },
        {
          features: [
            [4, 12, 3, 6, -1],
            [5, 12, 1, 6, 3],
          ],
          threshold: -0.002368980087339878,
          right_val: -0.090417243540287,
          left_val: 0.1437219977378845,
        },
        {
          features: [
            [3, 13, 4, 2, -1],
            [5, 13, 2, 2, 2],
          ],
          threshold: 0.004511626902967691,
          right_val: 0.2101106941699982,
          left_val: -0.0680682063102722,
        },
        {
          features: [
            [4, 14, 11, 2, -1],
            [4, 15, 11, 1, 2],
          ],
          threshold: -0.0014441140228882432,
          right_val: 0.1181610971689224,
          left_val: -0.1337653994560242,
        },
        {
          features: [
            [4, 13, 8, 3, -1],
            [4, 14, 8, 1, 3],
          ],
          threshold: 0.0021477979607880116,
          right_val: 0.1757165044546127,
          left_val: -0.098067082464695,
        },
        {
          features: [
            [3, 7, 6, 10, -1],
            [3, 7, 3, 5, 2],
            [6, 12, 3, 5, 2],
          ],
          threshold: 0.0225345995277166,
          right_val: -0.2808521091938019,
          left_val: 0.0532467402517796,
        },
        {
          features: [
            [5, 7, 6, 4, -1],
            [7, 7, 2, 4, 3],
          ],
          threshold: -0.0161652900278568,
          right_val: -0.0563493184745312,
          left_val: 0.26058629155159,
        },
        {
          features: [
            [2, 11, 10, 6, -1],
            [2, 14, 10, 3, 2],
          ],
          threshold: 0.0131579097360373,
          right_val: -0.310843288898468,
          left_val: 0.0449605993926525,
        },
        {
          features: [
            [5, 7, 9, 12, -1],
            [5, 13, 9, 6, 2],
          ],
          threshold: -0.0252186302095652,
          right_val: 0.117076501250267,
          left_val: -0.122453898191452,
        },
        {
          features: [
            [9, 12, 7, 4, -1],
            [9, 14, 7, 2, 2],
          ],
          threshold: -0.00010043029760709032,
          right_val: -0.2366541028022766,
          left_val: 0.0626686066389084,
        },
        {
          features: [
            [2, 0, 8, 4, -1],
            [2, 0, 4, 2, 2],
            [6, 2, 4, 2, 2],
          ],
          threshold: 0.0228843092918396,
          right_val: 0.2695189118385315,
          left_val: -0.056393388658762,
        },
        {
          features: [
            [4, 0, 4, 4, -1],
            [4, 0, 2, 2, 2],
            [6, 2, 2, 2, 2],
          ],
          threshold: -0.003765396075323224,
          right_val: -0.0603278391063213,
          left_val: 0.242650493979454,
        },
        {
          features: [
            [6, 2, 3, 2, -1],
            [7, 2, 1, 2, 3],
          ],
          threshold: -0.0012131360126659274,
          right_val: 0.0638662725687027,
          left_val: -0.2258134037256241,
        },
        {
          features: [
            [2, 11, 3, 4, -1],
            [3, 11, 1, 4, 3],
          ],
          threshold: 0.0036897920072078705,
          right_val: 0.1712114065885544,
          left_val: -0.0750563070178032,
        },
        {
          features: [
            [1, 17, 2, 1, -1],
            [2, 17, 1, 1, 2],
          ],
          threshold: 0.00039484380977228284,
          right_val: -0.1800608038902283,
          left_val: 0.0729255601763725,
        },
        {
          features: [
            [15, 12, 4, 3, -1],
            [15, 13, 4, 1, 3],
          ],
          threshold: -0.0028756330721080303,
          right_val: -0.0583127997815609,
          left_val: 0.23332679271698,
        },
        {
          features: [
            [9, 15, 7, 3, -1],
            [9, 16, 7, 1, 3],
          ],
          threshold: -0.0129395499825478,
          right_val: 0.0247462093830109,
          left_val: -0.5996682047843933,
        },
        {
          features: [
            [6, 7, 3, 2, -1],
            [7, 7, 1, 2, 3],
          ],
          threshold: 0.004892013967037201,
          right_val: 0.2714282870292664,
          left_val: -0.0508085489273071,
        },
        {
          features: [
            [3, 5, 12, 10, -1],
            [3, 5, 6, 5, 2],
            [9, 10, 6, 5, 2],
          ],
          threshold: -0.006368545815348625,
          right_val: 0.0787207037210464,
          left_val: -0.1775954961776733,
        },
        {
          features: [
            [4, 2, 12, 5, -1],
            [10, 2, 6, 5, 2],
          ],
          threshold: 0.0917000621557236,
          right_val: 0.5661062002182007,
          left_val: -0.024316219612956,
        },
        {
          features: [
            [9, 5, 3, 1, -1],
            [10, 5, 1, 1, 3],
          ],
          threshold: -0.0029075080528855324,
          right_val: 0.0267383493483067,
          left_val: -0.5347344279289246,
        },
        {
          features: [
            [2, 10, 3, 4, -1],
            [3, 10, 1, 4, 3],
          ],
          threshold: -0.00397827522829175,
          right_val: -0.0736341625452042,
          left_val: 0.1789894998073578,
        },
        {
          features: [
            [11, 5, 2, 10, -1],
            [11, 10, 2, 5, 2],
          ],
          threshold: 0.003818908939138055,
          right_val: -0.1261541992425919,
          left_val: 0.0966401472687721,
        },
        {
          features: [
            [8, 6, 7, 8, -1],
            [8, 10, 7, 4, 2],
          ],
          threshold: -0.0061400169506669044,
          right_val: 0.0489520691335201,
          left_val: -0.2802591025829315,
        },
        {
          features: [
            [5, 10, 1, 3, -1],
            [5, 11, 1, 1, 3],
          ],
          threshold: 0.004604837857186794,
          right_val: 0.3627172112464905,
          left_val: -0.0352979190647602,
        },
        {
          features: [
            [2, 8, 8, 4, -1],
            [6, 8, 4, 4, 2],
          ],
          threshold: 0.0695981532335281,
          right_val: -0.475231796503067,
          left_val: 0.0282364506274462,
        },
        {
          features: [
            [0, 9, 2, 2, -1],
            [1, 9, 1, 2, 2],
          ],
          threshold: 0.0008295492152683437,
          right_val: -0.1960850059986115,
          left_val: 0.065010666847229,
        },
        {
          features: [
            [13, 11, 4, 2, -1],
            [15, 11, 2, 2, 2],
          ],
          threshold: 0.0100734503939748,
          right_val: -0.5270252823829651,
          left_val: 0.0240914300084114,
        },
        {
          features: [
            [8, 6, 12, 5, -1],
            [12, 6, 4, 5, 3],
          ],
          threshold: -0.0499641709029675,
          right_val: -0.0529397688806057,
          left_val: 0.2706043124198914,
        },
        {
          features: [
            [11, 11, 9, 1, -1],
            [14, 11, 3, 1, 3],
          ],
          threshold: -0.0234257206320763,
          right_val: 0.0203999504446983,
          left_val: -0.6553804278373718,
        },
        {
          features: [
            [15, 10, 2, 4, -1],
            [15, 10, 1, 2, 2],
            [16, 12, 1, 2, 2],
          ],
          threshold: 0.00045370758743956685,
          right_val: 0.1257548928260803,
          left_val: -0.1014572978019714,
        },
        {
          features: [
            [18, 5, 1, 3, -1],
            [18, 6, 1, 1, 3],
          ],
          threshold: -0.000943292398005724,
          right_val: 0.0521473698318005,
          left_val: -0.2367783039808273,
        },
        {
          features: [
            [4, 10, 7, 3, -1],
            [4, 11, 7, 1, 3],
          ],
          threshold: -0.002550313016399741,
          right_val: -0.0643835365772247,
          left_val: 0.1869580000638962,
        },
        {
          features: [
            [8, 5, 3, 1, -1],
            [9, 5, 1, 1, 3],
          ],
          threshold: -0.00210311496630311,
          right_val: 0.0287637803703547,
          left_val: -0.4038110971450806,
        },
        {
          features: [
            [7, 13, 2, 3, -1],
            [7, 14, 2, 1, 3],
          ],
          threshold: 0.0023942890111356974,
          right_val: 0.2015120983123779,
          left_val: -0.0589619092643261,
        },
        {
          features: [
            [7, 14, 3, 3, -1],
            [7, 15, 3, 1, 3],
          ],
          threshold: 0.00034859919105656445,
          right_val: 0.1155984997749329,
          left_val: -0.1159474030137062,
        },
        {
          features: [
            [7, 15, 3, 3, -1],
            [7, 16, 3, 1, 3],
          ],
          threshold: 0.0006527964142151177,
          right_val: 0.145461305975914,
          left_val: -0.0965832471847534,
        },
        {
          features: [
            [14, 15, 1, 3, -1],
            [14, 16, 1, 1, 3],
          ],
          threshold: 0.0006620815256610513,
          right_val: -0.2340817004442215,
          left_val: 0.0556666404008865,
        },
        {
          features: [
            [2, 14, 10, 6, -1],
            [2, 17, 10, 3, 2],
          ],
          threshold: -0.1124671995639801,
          right_val: 0.0167008098214865,
          left_val: -0.7212910056114197,
        },
        {
          features: [
            [5, 12, 5, 3, -1],
            [5, 13, 5, 1, 3],
          ],
          threshold: 0.0024760260712355375,
          right_val: 0.1683201044797897,
          left_val: -0.0707524418830872,
        },
        {
          features: [
            [7, 9, 1, 6, -1],
            [7, 11, 1, 2, 3],
          ],
          threshold: -0.00877234898507595,
          right_val: 0.026006119325757,
          left_val: -0.4866676032543182,
        },
        {
          features: [
            [0, 6, 5, 6, -1],
            [0, 8, 5, 2, 3],
          ],
          threshold: 0.0288402792066336,
          right_val: -0.3454917073249817,
          left_val: 0.0333086997270584,
        },
        {
          features: [
            [6, 10, 3, 4, -1],
            [6, 12, 3, 2, 2],
          ],
          threshold: 0.00047115320921875536,
          right_val: -0.2133412063121796,
          left_val: 0.0586104691028595,
        },
        {
          features: [
            [4, 9, 9, 2, -1],
            [4, 10, 9, 1, 2],
          ],
          threshold: -0.007515721023082733,
          right_val: -0.0363076403737068,
          left_val: 0.3786672055721283,
        },
        {
          features: [
            [7, 3, 1, 2, -1],
            [7, 4, 1, 1, 2],
          ],
          threshold: -0.0001747977948980406,
          right_val: 0.0703804418444633,
          left_val: -0.1868792027235031,
        },
        {
          features: [
            [8, 9, 4, 4, -1],
            [8, 11, 4, 2, 2],
          ],
          threshold: 0.006982618942856789,
          right_val: 0.1854144930839539,
          left_val: -0.0753762125968933,
        },
        {
          features: [
            [11, 10, 3, 1, -1],
            [12, 10, 1, 1, 3],
          ],
          threshold: -0.002505349926650524,
          right_val: 0.0267652906477451,
          left_val: -0.4734547138214111,
        },
        {
          features: [
            [5, 7, 3, 2, -1],
            [5, 8, 3, 1, 2],
          ],
          threshold: 0.0006524071213789284,
          right_val: 0.1146010980010033,
          left_val: -0.1139867976307869,
        },
      ],
      threshold: -1.4971179962158203,
    },
    {
      simpleClassifiers: [
        {
          features: [
            [7, 0, 6, 6, -1],
            [7, 3, 6, 3, 2],
          ],
          threshold: 0.027968829497695,
          right_val: 0.339767187833786,
          left_val: -0.2405429035425186,
        },
        {
          features: [
            [5, 6, 3, 4, -1],
            [6, 6, 1, 4, 3],
          ],
          threshold: 0.004748410079628229,
          right_val: 0.2652375996112824,
          left_val: -0.1859841048717499,
        },
        {
          features: [
            [11, 1, 9, 12, -1],
            [14, 1, 3, 12, 3],
          ],
          threshold: -0.00967743806540966,
          right_val: -0.3173474073410034,
          left_val: 0.1357457935810089,
        },
        {
          features: [
            [6, 7, 4, 9, -1],
            [6, 10, 4, 3, 3],
          ],
          threshold: 0.001064994023181498,
          right_val: 0.070383183658123,
          left_val: -0.5035613179206848,
        },
        {
          features: [
            [11, 7, 8, 6, -1],
            [11, 7, 4, 3, 2],
            [15, 10, 4, 3, 2],
          ],
          threshold: 0.003015151945874095,
          right_val: 0.1675014048814774,
          left_val: -0.1758576929569244,
        },
        {
          features: [
            [8, 9, 7, 3, -1],
            [8, 10, 7, 1, 3],
          ],
          threshold: 0.0007682113791815937,
          right_val: 0.127484604716301,
          left_val: -0.2315856069326401,
        },
        {
          features: [
            [3, 2, 4, 18, -1],
            [5, 2, 2, 18, 2],
          ],
          threshold: -0.0566227808594704,
          right_val: -0.1152542978525162,
          left_val: 0.301032304763794,
        },
        {
          features: [
            [6, 12, 2, 3, -1],
            [6, 13, 2, 1, 3],
          ],
          threshold: 0.004788967780768871,
          right_val: 0.3577465116977692,
          left_val: -0.0687973499298096,
        },
        {
          features: [
            [6, 11, 8, 6, -1],
            [6, 11, 4, 3, 2],
            [10, 14, 4, 3, 2],
          ],
          threshold: 0.0037908130325376987,
          right_val: -0.233898401260376,
          left_val: 0.1125058010220528,
        },
        {
          features: [
            [5, 9, 4, 7, -1],
            [7, 9, 2, 7, 2],
          ],
          threshold: -0.0036302749067544937,
          right_val: 0.0601800717413425,
          left_val: -0.2742595076560974,
        },
        {
          features: [
            [5, 8, 6, 5, -1],
            [8, 8, 3, 5, 2],
          ],
          threshold: 0.0149861602112651,
          right_val: -0.3508821129798889,
          left_val: 0.0583701506257057,
        },
        {
          features: [
            [7, 11, 1, 3, -1],
            [7, 12, 1, 1, 3],
          ],
          threshold: 0.0006133863935247064,
          right_val: 0.1800414025783539,
          left_val: -0.1004550009965897,
        },
        {
          features: [
            [15, 10, 3, 1, -1],
            [16, 10, 1, 1, 3],
          ],
          threshold: 0.0017827099654823542,
          right_val: 0.2816573083400726,
          left_val: -0.0585045702755451,
        },
        {
          features: [
            [10, 12, 2, 2, -1],
            [10, 13, 2, 1, 2],
          ],
          threshold: 0.001027964986860752,
          right_val: -0.4163356125354767,
          left_val: 0.0460491515696049,
        },
        {
          features: [
            [11, 13, 2, 1, -1],
            [12, 13, 1, 1, 2],
          ],
          threshold: -0.000014470520000031684,
          right_val: -0.1700523942708969,
          left_val: 0.0975944772362709,
        },
        {
          features: [
            [6, 12, 2, 2, -1],
            [6, 13, 2, 1, 2],
          ],
          threshold: 0.0007291986257769167,
          right_val: 0.1968380063772202,
          left_val: -0.0892776921391487,
        },
        {
          features: [
            [11, 2, 2, 12, -1],
            [11, 2, 1, 6, 2],
            [12, 8, 1, 6, 2],
          ],
          threshold: -0.0012752750189974904,
          right_val: 0.0777813196182251,
          left_val: -0.2132434993982315,
        },
        {
          features: [
            [7, 0, 6, 6, -1],
            [7, 3, 6, 3, 2],
          ],
          threshold: 0.0275105703622103,
          right_val: -0.1846397966146469,
          left_val: 0.0980590879917145,
        },
        {
          features: [
            [4, 8, 4, 2, -1],
            [4, 9, 4, 1, 2],
          ],
          threshold: 0.003908299840986729,
          right_val: 0.1790283024311066,
          left_val: -0.098240077495575,
        },
        {
          features: [
            [14, 12, 1, 2, -1],
            [14, 13, 1, 1, 2],
          ],
          threshold: 0.0002828523865900934,
          right_val: -0.2590380907058716,
          left_val: 0.0648823827505112,
        },
        {
          features: [
            [4, 0, 2, 4, -1],
            [4, 0, 1, 2, 2],
            [5, 2, 1, 2, 2],
          ],
          threshold: 0.00586989289149642,
          right_val: 0.3558405935764313,
          left_val: -0.0484365001320839,
        },
        {
          features: [
            [15, 2, 2, 1, -1],
            [16, 2, 1, 1, 2],
          ],
          threshold: 0.000521064386703074,
          right_val: -0.2426872998476028,
          left_val: 0.0642008930444717,
        },
        {
          features: [
            [3, 14, 3, 1, -1],
            [4, 14, 1, 1, 3],
          ],
          threshold: -0.0038013618905097246,
          right_val: -0.0493724904954433,
          left_val: 0.3134953081607819,
        },
        {
          features: [
            [5, 11, 10, 4, -1],
            [5, 11, 5, 2, 2],
            [10, 13, 5, 2, 2],
          ],
          threshold: -0.0035830549895763397,
          right_val: 0.08592888712883,
          left_val: -0.1901564002037048,
        },
        {
          features: [
            [4, 10, 12, 3, -1],
            [4, 11, 12, 1, 3],
          ],
          threshold: 0.0073326388373970985,
          right_val: 0.1859602928161621,
          left_val: -0.0872440785169601,
        },
        {
          features: [
            [15, 2, 4, 6, -1],
            [15, 2, 2, 3, 2],
            [17, 5, 2, 3, 2],
          ],
          threshold: 0.0006811895873397589,
          right_val: -0.1738087981939316,
          left_val: 0.0903531834483147,
        },
        {
          features: [
            [5, 8, 1, 4, -1],
            [5, 10, 1, 2, 2],
          ],
          threshold: -0.0024127468932420015,
          right_val: -0.0620182603597641,
          left_val: 0.2658387124538422,
        },
        {
          features: [
            [6, 15, 3, 2, -1],
            [7, 15, 1, 2, 3],
          ],
          threshold: 0.004438928794115782,
          right_val: -0.4403919875621796,
          left_val: 0.0386724397540092,
        },
        {
          features: [
            [11, 19, 2, 1, -1],
            [12, 19, 1, 1, 2],
          ],
          threshold: 0.000029394390367087908,
          right_val: 0.1238996013998985,
          left_val: -0.1311666071414948,
        },
        {
          features: [
            [6, 7, 3, 2, -1],
            [7, 7, 1, 2, 3],
          ],
          threshold: 0.005261391866952181,
          right_val: 0.3143467903137207,
          left_val: -0.0543261393904686,
        },
        {
          features: [
            [6, 4, 2, 1, -1],
            [7, 4, 1, 1, 2],
          ],
          threshold: 0.0023712380789220333,
          right_val: -0.4593602120876312,
          left_val: 0.0352349318563938,
        },
        {
          features: [
            [6, 4, 3, 2, -1],
            [7, 4, 1, 2, 3],
          ],
          threshold: -0.002477414906024933,
          right_val: 0.0416763089597225,
          left_val: -0.325796514749527,
        },
        {
          features: [
            [6, 8, 2, 2, -1],
            [6, 8, 1, 1, 2],
            [7, 9, 1, 1, 2],
          ],
          threshold: 0.0005130806821398437,
          right_val: 0.1520960032939911,
          left_val: -0.0980328395962715,
        },
        {
          features: [
            [6, 15, 3, 2, -1],
            [7, 15, 1, 2, 3],
          ],
          threshold: -0.0007676187087781727,
          right_val: 0.0695636570453644,
          left_val: -0.2094428986310959,
        },
        {
          features: [
            [4, 8, 2, 4, -1],
            [4, 8, 1, 2, 2],
            [5, 10, 1, 2, 2],
          ],
          threshold: 0.004155183210968971,
          right_val: 0.247888594865799,
          left_val: -0.0591424182057381,
        },
        {
          features: [
            [10, 4, 7, 3, -1],
            [10, 5, 7, 1, 3],
          ],
          threshold: 0.0143151497468352,
          right_val: -0.6266369223594666,
          left_val: 0.0247133504599333,
        },
        {
          features: [
            [4, 5, 2, 6, -1],
            [5, 5, 1, 6, 2],
          ],
          threshold: 0.0008934789802879095,
          right_val: 0.1062666028738022,
          left_val: -0.1338738054037094,
        },
        {
          features: [
            [10, 13, 1, 3, -1],
            [10, 14, 1, 1, 3],
          ],
          threshold: -0.0005842578248120844,
          right_val: 0.0675528720021248,
          left_val: -0.2158381044864655,
        },
        {
          features: [
            [6, 11, 6, 3, -1],
            [9, 11, 3, 3, 2],
          ],
          threshold: 0.0008971214992925525,
          right_val: 0.0968595966696739,
          left_val: -0.1599808931350708,
        },
        {
          features: [
            [10, 14, 3, 2, -1],
            [10, 15, 3, 1, 2],
          ],
          threshold: -0.004457666072994471,
          right_val: 0.0344811081886292,
          left_val: -0.4683977961540222,
        },
        {
          features: [
            [8, 8, 4, 2, -1],
            [10, 8, 2, 2, 2],
          ],
          threshold: 0.0163166504353285,
          right_val: -0.7699069976806641,
          left_val: 0.0161764807999134,
        },
        {
          features: [
            [17, 12, 3, 1, -1],
            [18, 12, 1, 1, 3],
          ],
          threshold: -0.0019581869710236788,
          right_val: -0.0636050030589104,
          left_val: 0.2342319041490555,
        },
        {
          features: [
            [9, 0, 11, 16, -1],
            [9, 8, 11, 8, 2],
          ],
          threshold: 0.2962863147258759,
          right_val: -0.3899135887622833,
          left_val: 0.0380072817206383,
        },
        {
          features: [
            [17, 0, 3, 6, -1],
            [17, 2, 3, 2, 3],
          ],
          threshold: -0.000916769728064537,
          right_val: -0.1091248020529747,
          left_val: 0.1208648979663849,
        },
        {
          features: [
            [0, 0, 1, 2, -1],
            [0, 1, 1, 1, 2],
          ],
          threshold: -0.00025543299852870405,
          right_val: 0.0711042210459709,
          left_val: -0.1875578016042709,
        },
        {
          features: [
            [5, 11, 3, 3, -1],
            [5, 12, 3, 1, 3],
          ],
          threshold: 0.008294511586427689,
          right_val: 0.3355168104171753,
          left_val: -0.0399125702679157,
        },
        {
          features: [
            [4, 10, 10, 9, -1],
            [4, 13, 10, 3, 3],
          ],
          threshold: -0.0583876892924309,
          right_val: 0.0410111397504807,
          left_val: -0.3347511887550354,
        },
        {
          features: [
            [3, 3, 3, 5, -1],
            [4, 3, 1, 5, 3],
          ],
          threshold: 0.001092746970243752,
          right_val: 0.1604676991701126,
          left_val: -0.0832434892654419,
        },
        {
          features: [
            [6, 1, 2, 6, -1],
            [6, 3, 2, 2, 3],
          ],
          threshold: 0.0010653319768607616,
          right_val: 0.1056177988648415,
          left_val: -0.1192004010081291,
        },
        {
          features: [
            [5, 0, 8, 6, -1],
            [5, 2, 8, 2, 3],
          ],
          threshold: -0.0353237204253674,
          right_val: -0.0476509109139442,
          left_val: 0.2839944958686829,
        },
        {
          features: [
            [0, 0, 1, 2, -1],
            [0, 1, 1, 1, 2],
          ],
          threshold: 0.000679764780215919,
          right_val: -0.2274127006530762,
          left_val: 0.0592235215008259,
        },
        {
          features: [
            [6, 3, 6, 4, -1],
            [8, 3, 2, 4, 3],
          ],
          threshold: -0.0248105190694332,
          right_val: 0.0188289396464825,
          left_val: -0.6578854918479919,
        },
        {
          features: [
            [8, 6, 3, 3, -1],
            [8, 7, 3, 1, 3],
          ],
          threshold: 0.004588034935295582,
          right_val: 0.2688626050949097,
          left_val: -0.0507998690009117,
        },
        {
          features: [
            [9, 6, 3, 6, -1],
            [9, 8, 3, 2, 3],
          ],
          threshold: 0.0039034360088407993,
          right_val: 0.2264453023672104,
          left_val: -0.059183020144701,
        },
        {
          features: [
            [4, 3, 12, 12, -1],
            [4, 3, 6, 6, 2],
            [10, 9, 6, 6, 2],
          ],
          threshold: 0.1236065998673439,
          right_val: -0.6784409880638123,
          left_val: 0.0220522992312908,
        },
        {
          features: [
            [13, 8, 3, 2, -1],
            [13, 9, 3, 1, 2],
          ],
          threshold: -0.0003785640874411911,
          right_val: 0.0575223006308079,
          left_val: -0.2171549946069717,
        },
        {
          features: [
            [4, 3, 10, 2, -1],
            [9, 3, 5, 2, 2],
          ],
          threshold: 0.0285622291266918,
          right_val: 0.4247479140758514,
          left_val: -0.0340952686965466,
        },
        {
          features: [
            [18, 14, 2, 2, -1],
            [18, 14, 1, 1, 2],
            [19, 15, 1, 1, 2],
          ],
          threshold: 0.0022348840720951557,
          right_val: 0.3505004048347473,
          left_val: -0.0356555283069611,
        },
        {
          features: [
            [5, 6, 6, 2, -1],
            [8, 6, 3, 2, 2],
          ],
          threshold: 0.019211059436202,
          right_val: -0.5931491851806641,
          left_val: 0.0250783506780863,
        },
        {
          features: [
            [0, 14, 20, 5, -1],
            [10, 14, 10, 5, 2],
          ],
          threshold: 0.156116396188736,
          right_val: -0.4874055087566376,
          left_val: 0.0236126407980919,
        },
        {
          features: [
            [9, 17, 2, 1, -1],
            [10, 17, 1, 1, 2],
          ],
          threshold: -0.0012261980446055532,
          right_val: 0.039526391774416,
          left_val: -0.3042171895503998,
        },
        {
          features: [
            [5, 16, 5, 3, -1],
            [5, 17, 5, 1, 3],
          ],
          threshold: 0.003656175918877125,
          right_val: 0.2026260942220688,
          left_val: -0.0776275396347046,
        },
        {
          features: [
            [9, 16, 3, 2, -1],
            [10, 16, 1, 2, 3],
          ],
          threshold: 0.0011567790061235428,
          right_val: -0.2436849027872086,
          left_val: 0.055682398378849,
        },
        {
          features: [
            [6, 5, 5, 3, -1],
            [6, 6, 5, 1, 3],
          ],
          threshold: 0.006276453845202923,
          right_val: 0.211830198764801,
          left_val: -0.0644526034593582,
        },
        {
          features: [
            [11, 12, 3, 8, -1],
            [12, 12, 1, 8, 3],
          ],
          threshold: 0.0120912399142981,
          right_val: -0.6223167777061462,
          left_val: 0.0206679794937372,
        },
        {
          features: [
            [4, 3, 3, 9, -1],
            [4, 6, 3, 3, 3],
          ],
          threshold: 0.0003756895021069795,
          right_val: -0.1780910938978195,
          left_val: 0.0736704766750336,
        },
        {
          features: [
            [11, 0, 3, 3, -1],
            [12, 0, 1, 3, 3],
          ],
          threshold: 0.003815766889601946,
          right_val: -0.3626295924186707,
          left_val: 0.0338457114994526,
        },
        {
          features: [
            [5, 17, 10, 2, -1],
            [5, 17, 5, 1, 2],
            [10, 18, 5, 1, 2],
          ],
          threshold: -0.0013252210337668657,
          right_val: -0.081727422773838,
          left_val: 0.1473249047994614,
        },
        {
          features: [
            [5, 15, 2, 3, -1],
            [5, 16, 2, 1, 3],
          ],
          threshold: 0.0021575710270553827,
          right_val: 0.1756231933832169,
          left_val: -0.0686241984367371,
        },
        {
          features: [
            [6, 14, 2, 4, -1],
            [6, 14, 1, 2, 2],
            [7, 16, 1, 2, 2],
          ],
          threshold: -0.00645481888204813,
          right_val: 0.0230200495570898,
          left_val: -0.5815926790237427,
        },
        {
          features: [
            [10, 17, 6, 3, -1],
            [10, 18, 6, 1, 3],
          ],
          threshold: -0.00810428336262703,
          right_val: 0.035372331738472,
          left_val: -0.3554920852184296,
        },
        {
          features: [
            [19, 5, 1, 3, -1],
            [19, 6, 1, 1, 3],
          ],
          threshold: 0.00016489460540469736,
          right_val: -0.1571836024522781,
          left_val: 0.074472688138485,
        },
        {
          features: [
            [16, 13, 2, 2, -1],
            [16, 13, 1, 1, 2],
            [17, 14, 1, 1, 2],
          ],
          threshold: -0.0019494029693305492,
          right_val: -0.0362138189375401,
          left_val: 0.3515708148479462,
        },
        {
          features: [
            [0, 11, 2, 1, -1],
            [1, 11, 1, 1, 2],
          ],
          threshold: -0.00015267659910023212,
          right_val: 0.0848027616739273,
          left_val: -0.1411571949720383,
        },
        {
          features: [
            [4, 12, 6, 6, -1],
            [4, 12, 3, 3, 2],
            [7, 15, 3, 3, 2],
          ],
          threshold: 0.023890420794487,
          right_val: -0.6318603157997131,
          left_val: 0.0193176697939634,
        },
        {
          features: [
            [5, 15, 4, 3, -1],
            [5, 16, 4, 1, 3],
          ],
          threshold: -0.004495036788284779,
          right_val: -0.0591430887579918,
          left_val: 0.2125412970781326,
        },
        {
          features: [
            [10, 16, 3, 2, -1],
            [11, 16, 1, 2, 3],
          ],
          threshold: 0.0028725271113216877,
          right_val: -0.3950523138046265,
          left_val: 0.032794039696455,
        },
        {
          features: [
            [1, 0, 10, 2, -1],
            [1, 0, 5, 1, 2],
            [6, 1, 5, 1, 2],
          ],
          threshold: 0.0020885460544377565,
          right_val: 0.1434766948223114,
          left_val: -0.0854437872767448,
        },
        {
          features: [
            [2, 0, 18, 14, -1],
            [11, 0, 9, 14, 2],
          ],
          threshold: -0.4434382915496826,
          right_val: 0.0294280499219894,
          left_val: -0.4005231857299805,
        },
        {
          features: [
            [15, 7, 4, 7, -1],
            [17, 7, 2, 7, 2],
          ],
          threshold: 0.0201991703361273,
          right_val: -0.3176333904266357,
          left_val: 0.0400005504488945,
        },
        {
          features: [
            [5, 10, 2, 4, -1],
            [6, 10, 1, 4, 2],
          ],
          threshold: 0.0145708797499537,
          right_val: -0.8644195199012756,
          left_val: 0.0136628001928329,
        },
        {
          features: [
            [15, 16, 3, 1, -1],
            [16, 16, 1, 1, 3],
          ],
          threshold: -0.003808015026152134,
          right_val: -0.0338389687240124,
          left_val: 0.409307211637497,
        },
        {
          features: [
            [7, 15, 5, 3, -1],
            [7, 16, 5, 1, 3],
          ],
          threshold: 0.0010009920224547386,
          right_val: 0.1392879039049149,
          left_val: -0.0826002508401871,
        },
        {
          features: [
            [12, 1, 6, 3, -1],
            [14, 1, 2, 3, 3],
          ],
          threshold: 0.0011500980472192168,
          right_val: -0.1743306070566177,
          left_val: 0.069677546620369,
        },
        {
          features: [
            [16, 2, 2, 1, -1],
            [17, 2, 1, 1, 2],
          ],
          threshold: 0.0003472086100373417,
          right_val: -0.1740380972623825,
          left_val: 0.0666593834757805,
        },
        {
          features: [
            [17, 0, 2, 2, -1],
            [17, 0, 1, 1, 2],
            [18, 1, 1, 1, 2],
          ],
          threshold: 0.0027565560303628445,
          right_val: 0.402435690164566,
          left_val: -0.0292856805026531,
        },
        {
          features: [
            [1, 0, 4, 6, -1],
            [1, 2, 4, 2, 3],
          ],
          threshold: -0.0241242200136185,
          right_val: 0.0373305082321167,
          left_val: -0.3242420852184296,
        },
        {
          features: [
            [3, 1, 6, 18, -1],
            [3, 7, 6, 6, 3],
          ],
          threshold: -0.1398912072181702,
          right_val: 0.0179296191781759,
          left_val: -0.659674882888794,
        },
        {
          features: [
            [5, 1, 1, 12, -1],
            [5, 7, 1, 6, 2],
          ],
          threshold: 0.0309976805001497,
          right_val: -0.6953263878822327,
          left_val: 0.0141005897894502,
        },
        {
          features: [
            [16, 9, 2, 2, -1],
            [16, 9, 1, 1, 2],
            [17, 10, 1, 1, 2],
          ],
          threshold: 0.0004619176033884287,
          right_val: 0.1806613951921463,
          left_val: -0.0679441466927528,
        },
        {
          features: [
            [4, 2, 2, 11, -1],
            [5, 2, 1, 11, 2],
          ],
          threshold: 0.0342644900083542,
          right_val: -0.5863891839981079,
          left_val: 0.0222986396402121,
        },
        {
          features: [
            [4, 8, 3, 1, -1],
            [5, 8, 1, 1, 3],
          ],
          threshold: 0.003975638188421726,
          right_val: 0.3166910111904144,
          left_val: -0.0418037213385105,
        },
        {
          features: [
            [14, 18, 2, 2, -1],
            [14, 19, 2, 1, 2],
          ],
          threshold: -0.00034192908788099885,
          right_val: 0.077484056353569,
          left_val: -0.1581079065799713,
        },
        {
          features: [
            [10, 0, 10, 10, -1],
            [10, 0, 5, 5, 2],
            [15, 5, 5, 5, 2],
          ],
          threshold: 0.0716729536652565,
          right_val: 0.5246502757072449,
          left_val: -0.0233027692884207,
        },
        {
          features: [
            [19, 6, 1, 2, -1],
            [19, 7, 1, 1, 2],
          ],
          threshold: 0.0007181232213042676,
          right_val: -0.2777172923088074,
          left_val: 0.0482687801122665,
        },
        {
          features: [
            [11, 0, 6, 8, -1],
            [11, 0, 3, 4, 2],
            [14, 4, 3, 4, 2],
          ],
          threshold: -0.001888119033537805,
          right_val: -0.1480201035737991,
          left_val: 0.0831849873065948,
        },
        {
          features: [
            [5, 0, 2, 2, -1],
            [5, 0, 1, 1, 2],
            [6, 1, 1, 1, 2],
          ],
          threshold: -0.0012498029973357916,
          right_val: -0.0497693903744221,
          left_val: 0.2532911896705627,
        },
        {
          features: [
            [3, 1, 9, 11, -1],
            [6, 1, 3, 11, 3],
          ],
          threshold: -0.1275610029697418,
          right_val: 0.0208717007189989,
          left_val: -0.6797056794166565,
        },
        {
          features: [
            [10, 11, 3, 2, -1],
            [10, 12, 3, 1, 2],
          ],
          threshold: -0.000014621549780713394,
          right_val: -0.1504373997449875,
          left_val: 0.079338513314724,
        },
        {
          features: [
            [10, 9, 4, 2, -1],
            [12, 9, 2, 2, 2],
          ],
          threshold: 0.003578867996111512,
          right_val: 0.240755096077919,
          left_val: -0.0554691106081009,
        },
        {
          features: [
            [13, 7, 1, 6, -1],
            [13, 9, 1, 2, 3],
          ],
          threshold: 0.009490215219557285,
          right_val: -0.5368028879165649,
          left_val: 0.0286372397094965,
        },
        {
          features: [
            [8, 10, 6, 2, -1],
            [8, 10, 3, 1, 2],
            [11, 11, 3, 1, 2],
          ],
          threshold: 0.0102830501273274,
          right_val: -0.7750126719474792,
          left_val: 0.0115505298599601,
        },
        {
          features: [
            [4, 11, 4, 6, -1],
            [4, 14, 4, 3, 2],
          ],
          threshold: -0.0425072908401489,
          right_val: 0.009726175107061863,
          left_val: -0.8877049088478088,
        },
        {
          features: [
            [17, 4, 2, 3, -1],
            [17, 5, 2, 1, 3],
          ],
          threshold: 0.0003615593013819307,
          right_val: -0.1710951030254364,
          left_val: 0.0644070133566856,
        },
        {
          features: [
            [10, 2, 8, 14, -1],
            [10, 2, 4, 7, 2],
            [14, 9, 4, 7, 2],
          ],
          threshold: -0.0342456288635731,
          right_val: -0.0471888706088066,
          left_val: 0.2423160970211029,
        },
        {
          features: [
            [12, 8, 8, 7, -1],
            [16, 8, 4, 7, 2],
          ],
          threshold: -0.1280671060085297,
          right_val: 0.0218543000519276,
          left_val: -0.5486940145492554,
        },
        {
          features: [
            [1, 2, 18, 1, -1],
            [7, 2, 6, 1, 3],
          ],
          threshold: 0.0539183393120766,
          right_val: 0.48263218998909,
          left_val: -0.0254150591790676,
        },
        {
          features: [
            [0, 1, 8, 19, -1],
            [4, 1, 4, 19, 2],
          ],
          threshold: -0.0377118103206158,
          right_val: -0.0888717100024223,
          left_val: 0.1417693942785263,
        },
        {
          features: [
            [0, 0, 8, 12, -1],
            [4, 0, 4, 12, 2],
          ],
          threshold: -0.2831090986728668,
          right_val: 0.0205638203769922,
          left_val: -0.6492571234703064,
        },
        {
          features: [
            [13, 5, 5, 12, -1],
            [13, 11, 5, 6, 2],
          ],
          threshold: -0.011926019564271,
          right_val: 0.0518516600131989,
          left_val: -0.2175675928592682,
        },
        {
          features: [
            [7, 9, 1, 4, -1],
            [7, 11, 1, 2, 2],
          ],
          threshold: 0.00037750680348835886,
          right_val: -0.1636016964912415,
          left_val: 0.0723406225442886,
        },
        {
          features: [
            [0, 13, 10, 3, -1],
            [5, 13, 5, 3, 2],
          ],
          threshold: 0.0158659107983112,
          right_val: 0.1645365953445435,
          left_val: -0.0799402371048927,
        },
        {
          features: [
            [2, 7, 12, 4, -1],
            [6, 7, 4, 4, 3],
          ],
          threshold: 0.0711757093667984,
          right_val: -0.4198819100856781,
          left_val: 0.0315890200436115,
        },
        {
          features: [
            [9, 1, 2, 6, -1],
            [9, 1, 1, 3, 2],
            [10, 4, 1, 3, 2],
          ],
          threshold: 0.0058520520105957985,
          right_val: -0.486042708158493,
          left_val: 0.0232790801674128,
        },
        {
          features: [
            [6, 8, 3, 3, -1],
            [7, 8, 1, 3, 3],
          ],
          threshold: -0.0013924130471423268,
          right_val: -0.0737839266657829,
          left_val: 0.1690838038921356,
        },
        {
          features: [
            [4, 11, 3, 1, -1],
            [5, 11, 1, 1, 3],
          ],
          threshold: -0.00018412459758110344,
          right_val: -0.1031398996710777,
          left_val: 0.1223205998539925,
        },
        {
          features: [
            [5, 10, 1, 2, -1],
            [5, 11, 1, 1, 2],
          ],
          threshold: 0.00022130980505608022,
          right_val: 0.1633287072181702,
          left_val: -0.0819763764739037,
        },
        {
          features: [
            [0, 17, 4, 1, -1],
            [2, 17, 2, 1, 2],
          ],
          threshold: 0.00020723740453831851,
          right_val: -0.1373358070850372,
          left_val: 0.0927302017807961,
        },
        {
          features: [
            [1, 16, 2, 1, -1],
            [2, 16, 1, 1, 2],
          ],
          threshold: -0.00038736319402232766,
          right_val: 0.0848383828997612,
          left_val: -0.2000461965799332,
        },
        {
          features: [
            [7, 14, 2, 3, -1],
            [7, 15, 2, 1, 3],
          ],
          threshold: 0.0032468559220433235,
          right_val: 0.223649799823761,
          left_val: -0.0564392581582069,
        },
        {
          features: [
            [10, 13, 2, 2, -1],
            [10, 14, 2, 1, 2],
          ],
          threshold: 0.0009308676817454398,
          right_val: -0.3970127999782562,
          left_val: 0.0319265797734261,
        },
        {
          features: [
            [16, 11, 3, 1, -1],
            [17, 11, 1, 1, 3],
          ],
          threshold: 0.00103060994297266,
          right_val: 0.201897606253624,
          left_val: -0.0601548887789249,
        },
        {
          features: [
            [16, 10, 3, 2, -1],
            [17, 10, 1, 2, 3],
          ],
          threshold: -0.0007602726109325886,
          right_val: -0.0996653735637665,
          left_val: 0.1490111947059631,
        },
        {
          features: [
            [7, 2, 3, 1, -1],
            [8, 2, 1, 1, 3],
          ],
          threshold: -0.00040442569297738373,
          right_val: 0.0741251483559608,
          left_val: -0.1911340951919556,
        },
        {
          features: [
            [14, 4, 5, 3, -1],
            [14, 5, 5, 1, 3],
          ],
          threshold: -0.004778312053531408,
          right_val: 0.0365316793322563,
          left_val: -0.3573026955127716,
        },
        {
          features: [
            [7, 7, 2, 3, -1],
            [8, 7, 1, 3, 2],
          ],
          threshold: -0.0007767258794046938,
          right_val: -0.1297499984502792,
          left_val: 0.1024286970496178,
        },
        {
          features: [
            [5, 7, 6, 7, -1],
            [8, 7, 3, 7, 2],
          ],
          threshold: -0.005741796921938658,
          right_val: 0.0701112821698189,
          left_val: -0.1669895052909851,
        },
        {
          features: [
            [4, 2, 2, 6, -1],
            [4, 2, 1, 3, 2],
            [5, 5, 1, 3, 2],
          ],
          threshold: -0.0108793200924993,
          right_val: -0.0292555894702673,
          left_val: 0.4412057101726532,
        },
        {
          features: [
            [4, 9, 2, 3, -1],
            [4, 10, 2, 1, 3],
          ],
          threshold: 0.0006416349206119776,
          right_val: 0.1068117991089821,
          left_val: -0.1119527965784073,
        },
        {
          features: [
            [8, 6, 7, 12, -1],
            [8, 10, 7, 4, 3],
          ],
          threshold: 0.0183418300002813,
          right_val: -0.0801891162991524,
          left_val: 0.1638768017292023,
        },
        {
          features: [
            [8, 5, 2, 10, -1],
            [8, 10, 2, 5, 2],
          ],
          threshold: -0.0015051739756017923,
          right_val: 0.061541710048914,
          left_val: -0.2231325954198837,
        },
        {
          features: [
            [4, 3, 3, 5, -1],
            [5, 3, 1, 5, 3],
          ],
          threshold: 0.004434520844370127,
          right_val: 0.2229906022548676,
          left_val: -0.0666461363434792,
        },
        {
          features: [
            [9, 12, 2, 1, -1],
            [10, 12, 1, 1, 2],
          ],
          threshold: -0.000014749550246051513,
          right_val: -0.103778101503849,
          left_val: 0.1159788966178894,
        },
        {
          features: [
            [3, 8, 3, 4, -1],
            [4, 8, 1, 4, 3],
          ],
          threshold: -0.0026539659593254328,
          right_val: -0.0864887833595276,
          left_val: 0.1311603039503098,
        },
        {
          features: [
            [13, 14, 3, 3, -1],
            [13, 15, 3, 1, 3],
          ],
          threshold: 0.002774355001747608,
          right_val: -0.3122506141662598,
          left_val: 0.0410640686750412,
        },
        {
          features: [
            [1, 14, 2, 3, -1],
            [2, 14, 1, 3, 2],
          ],
          threshold: 0.0011590829817578197,
          right_val: -0.1741307973861694,
          left_val: 0.0643094778060913,
        },
        {
          features: [
            [5, 0, 2, 4, -1],
            [5, 0, 1, 2, 2],
            [6, 2, 1, 2, 2],
          ],
          threshold: 0.000923150684684515,
          right_val: 0.144390806555748,
          left_val: -0.0829740017652512,
        },
        {
          features: [
            [5, 14, 4, 3, -1],
            [5, 15, 4, 1, 3],
          ],
          threshold: -0.008232359774410725,
          right_val: -0.041229110211134,
          left_val: 0.3038038909435272,
        },
        {
          features: [
            [6, 12, 2, 6, -1],
            [6, 12, 1, 3, 2],
            [7, 15, 1, 3, 2],
          ],
          threshold: 0.0035314110573381186,
          right_val: -0.3309716880321503,
          left_val: 0.0395112596452236,
        },
        {
          features: [
            [6, 13, 2, 2, -1],
            [7, 13, 1, 2, 2],
          ],
          threshold: 0.005749076139181852,
          right_val: -0.5878059267997742,
          left_val: 0.019821660593152,
        },
        {
          features: [
            [9, 10, 4, 5, -1],
            [11, 10, 2, 5, 2],
          ],
          threshold: 0.007858497090637684,
          right_val: 0.2724958956241608,
          left_val: -0.0499522387981415,
        },
        {
          features: [
            [11, 3, 2, 1, -1],
            [12, 3, 1, 1, 2],
          ],
          threshold: -0.000014245980310079176,
          right_val: -0.1322834938764572,
          left_val: 0.0880103409290314,
        },
        {
          features: [
            [6, 7, 2, 2, -1],
            [6, 7, 1, 1, 2],
            [7, 8, 1, 1, 2],
          ],
          threshold: 0.0006936417776159942,
          right_val: 0.1746363043785095,
          left_val: -0.0673918873071671,
        },
        {
          features: [
            [5, 3, 6, 5, -1],
            [7, 3, 2, 5, 3],
          ],
          threshold: -0.0298377498984337,
          right_val: 0.0248714108020067,
          left_val: -0.5170981287956238,
        },
        {
          features: [
            [5, 6, 4, 8, -1],
            [7, 6, 2, 8, 2],
          ],
          threshold: 0.007138359826058149,
          right_val: -0.190372496843338,
          left_val: 0.0674305036664009,
        },
        {
          features: [
            [5, 7, 6, 3, -1],
            [7, 7, 2, 3, 3],
          ],
          threshold: 0.0175825692713261,
          right_val: 0.3533546924591065,
          left_val: -0.0366223715245724,
        },
        {
          features: [
            [9, 12, 3, 4, -1],
            [10, 12, 1, 4, 3],
          ],
          threshold: -0.001252784044481814,
          right_val: 0.0612000189721584,
          left_val: -0.2173064947128296,
        },
        {
          features: [
            [16, 9, 3, 1, -1],
            [17, 9, 1, 1, 3],
          ],
          threshold: 0.000745750090572983,
          right_val: 0.1977504044771195,
          left_val: -0.0644676610827446,
        },
        {
          features: [
            [13, 14, 3, 3, -1],
            [13, 15, 3, 1, 3],
          ],
          threshold: -0.000726838712580502,
          right_val: 0.0717199519276619,
          left_val: -0.1723337024450302,
        },
        {
          features: [
            [7, 13, 4, 2, -1],
            [7, 13, 2, 1, 2],
            [9, 14, 2, 1, 2],
          ],
          threshold: 0.0026301289908587933,
          right_val: 0.3306629061698914,
          left_val: -0.039274338632822,
        },
        {
          features: [
            [10, 13, 1, 2, -1],
            [10, 14, 1, 1, 2],
          ],
          threshold: -0.000014553769688063767,
          right_val: -0.1785241961479187,
          left_val: 0.0796985775232315,
        },
        {
          features: [
            [9, 13, 2, 3, -1],
            [9, 14, 2, 1, 3],
          ],
          threshold: -0.00045518940896727145,
          right_val: 0.0756603628396988,
          left_val: -0.1666225045919418,
        },
        {
          features: [
            [9, 14, 2, 3, -1],
            [9, 15, 2, 1, 3],
          ],
          threshold: -0.00040261688991449773,
          right_val: 0.081017293035984,
          left_val: -0.1421436965465546,
        },
      ],
      threshold: -1.5120370388031006,
    },
    {
      simpleClassifiers: [
        {
          features: [
            [9, 6, 8, 1, -1],
            [13, 6, 4, 1, 2],
          ],
          threshold: -0.00834396667778492,
          right_val: -0.2676644921302795,
          left_val: 0.3194215893745422,
        },
        {
          features: [
            [6, 8, 3, 2, -1],
            [6, 9, 3, 1, 2],
          ],
          threshold: 0.0007807327783666551,
          right_val: 0.1362888067960739,
          left_val: -0.3485263884067535,
        },
        {
          features: [
            [5, 6, 2, 3, -1],
            [6, 6, 1, 3, 2],
          ],
          threshold: 0.0008650586241856217,
          right_val: 0.1741763949394226,
          left_val: -0.2532368004322052,
        },
        {
          features: [
            [12, 10, 2, 6, -1],
            [12, 13, 2, 3, 2],
          ],
          threshold: -0.00020879819930996746,
          right_val: -0.3603850901126862,
          left_val: 0.0885037034749985,
        },
        {
          features: [
            [1, 0, 18, 2, -1],
            [7, 0, 6, 2, 3],
          ],
          threshold: -0.007466724142432213,
          right_val: -0.1736644953489304,
          left_val: 0.1612063050270081,
        },
        {
          features: [
            [9, 7, 4, 6, -1],
            [9, 7, 2, 3, 2],
            [11, 10, 2, 3, 2],
          ],
          threshold: -0.0006938375881873071,
          right_val: -0.2679347991943359,
          left_val: 0.0968730077147484,
        },
        {
          features: [
            [12, 10, 2, 4, -1],
            [13, 10, 1, 4, 2],
          ],
          threshold: -0.00004792699110112153,
          right_val: -0.2621222138404846,
          left_val: 0.091756246984005,
        },
        {
          features: [
            [13, 12, 1, 2, -1],
            [13, 13, 1, 1, 2],
          ],
          threshold: -0.0015861799474805593,
          right_val: -0.007416837848722935,
          left_val: -0.6140087246894836,
        },
        {
          features: [
            [13, 18, 2, 2, -1],
            [14, 18, 1, 2, 2],
          ],
          threshold: 0.000044573731429409236,
          right_val: 0.1385574042797089,
          left_val: -0.1484186053276062,
        },
        {
          features: [
            [15, 4, 2, 1, -1],
            [16, 4, 1, 1, 2],
          ],
          threshold: 0.0005010414170101285,
          right_val: -0.2959606945514679,
          left_val: 0.0590889416635036,
        },
        {
          features: [
            [5, 7, 6, 3, -1],
            [7, 7, 2, 3, 3],
          ],
          threshold: -0.00472436286509037,
          right_val: -0.1062470003962517,
          left_val: 0.1709202975034714,
        },
        {
          features: [
            [5, 8, 8, 3, -1],
            [9, 8, 4, 3, 2],
          ],
          threshold: 0.003917105030268431,
          right_val: -0.2277520000934601,
          left_val: 0.0886052027344704,
        },
        {
          features: [
            [6, 12, 6, 3, -1],
            [9, 12, 3, 3, 2],
          ],
          threshold: 0.0008867572760209441,
          right_val: 0.1195868030190468,
          left_val: -0.1683963984251022,
        },
        {
          features: [
            [12, 14, 3, 6, -1],
            [13, 14, 1, 6, 3],
          ],
          threshold: -0.004263455979526043,
          right_val: 0.0472662709653378,
          left_val: -0.3366324007511139,
        },
        {
          features: [
            [18, 9, 2, 8, -1],
            [18, 9, 1, 4, 2],
            [19, 13, 1, 4, 2],
          ],
          threshold: 0.006800650153309107,
          right_val: 0.3167530000209808,
          left_val: -0.0592370815575123,
        },
        {
          features: [
            [5, 5, 7, 3, -1],
            [5, 6, 7, 1, 3],
          ],
          threshold: -0.0131689896807075,
          right_val: -0.0427148900926113,
          left_val: 0.371625691652298,
        },
        {
          features: [
            [10, 13, 2, 2, -1],
            [10, 13, 1, 1, 2],
            [11, 14, 1, 1, 2],
          ],
          threshold: 0.0007388130179606378,
          right_val: -0.3095371127128601,
          left_val: 0.0591581016778946,
        },
        {
          features: [
            [5, 10, 1, 3, -1],
            [5, 11, 1, 1, 3],
          ],
          threshold: 0.0017939460230991244,
          right_val: 0.2045253068208695,
          left_val: -0.0846152827143669,
        },
        {
          features: [
            [6, 11, 2, 3, -1],
            [6, 12, 2, 1, 3],
          ],
          threshold: 0.0016819390002638102,
          right_val: 0.2058054953813553,
          left_val: -0.0867037624120712,
        },
        {
          features: [
            [9, 13, 4, 2, -1],
            [9, 13, 2, 1, 2],
            [11, 14, 2, 1, 2],
          ],
          threshold: -0.0025033599231392145,
          right_val: 0.0387078300118446,
          left_val: -0.4347319006919861,
        },
        {
          features: [
            [7, 12, 1, 3, -1],
            [7, 13, 1, 1, 3],
          ],
          threshold: 0.0003365855955053121,
          right_val: 0.1523838043212891,
          left_val: -0.1071731001138687,
        },
        {
          features: [
            [7, 10, 3, 6, -1],
            [7, 12, 3, 2, 3],
          ],
          threshold: 0.0130378799512982,
          right_val: -0.4039565026760101,
          left_val: 0.0446826592087746,
        },
        {
          features: [
            [13, 8, 4, 4, -1],
            [13, 10, 4, 2, 2],
          ],
          threshold: 0.0001374372950522229,
          right_val: 0.0686434134840965,
          left_val: -0.2143251001834869,
        },
        {
          features: [
            [8, 0, 12, 18, -1],
            [8, 9, 12, 9, 2],
          ],
          threshold: 0.371788889169693,
          right_val: -0.4599837958812714,
          left_val: 0.0345029309391975,
        },
        {
          features: [
            [18, 9, 2, 10, -1],
            [18, 9, 1, 5, 2],
            [19, 14, 1, 5, 2],
          ],
          threshold: -0.007164915092289448,
          right_val: -0.0545579493045807,
          left_val: 0.2664088010787964,
        },
        {
          features: [
            [14, 2, 3, 6, -1],
            [14, 5, 3, 3, 2],
          ],
          threshold: -0.0007198547828011215,
          right_val: 0.0982544869184494,
          left_val: -0.1441569030284882,
        },
        {
          features: [
            [10, 0, 3, 14, -1],
            [11, 0, 1, 14, 3],
          ],
          threshold: 0.016854539513588,
          right_val: -0.4522759914398193,
          left_val: 0.0284286793321371,
        },
        {
          features: [
            [6, 16, 8, 4, -1],
            [6, 16, 4, 2, 2],
            [10, 18, 4, 2, 2],
          ],
          threshold: 0.0136247295886278,
          right_val: 0.2271599024534226,
          left_val: -0.0604742988944054,
        },
        {
          features: [
            [5, 3, 5, 12, -1],
            [5, 7, 5, 4, 3],
          ],
          threshold: 0.0136201400309801,
          right_val: -0.1810465008020401,
          left_val: 0.0791776031255722,
        },
        {
          features: [
            [4, 15, 6, 3, -1],
            [4, 16, 6, 1, 3],
          ],
          threshold: -0.004497671965509653,
          right_val: -0.0713925734162331,
          left_val: 0.2130009979009628,
        },
        {
          features: [
            [6, 15, 1, 3, -1],
            [6, 16, 1, 1, 3],
          ],
          threshold: 0.0007161141838878393,
          right_val: 0.1583044975996018,
          left_val: -0.0942373797297478,
        },
        {
          features: [
            [13, 1, 2, 1, -1],
            [14, 1, 1, 1, 2],
          ],
          threshold: 0.0007065106183290482,
          right_val: -0.2915244996547699,
          left_val: 0.0488406717777252,
        },
        {
          features: [
            [2, 2, 18, 9, -1],
            [11, 2, 9, 9, 2],
          ],
          threshold: -0.3100227117538452,
          right_val: 0.0343696512281895,
          left_val: -0.3851189017295837,
        },
        {
          features: [
            [4, 16, 2, 4, -1],
            [4, 16, 1, 2, 2],
            [5, 18, 1, 2, 2],
          ],
          threshold: 0.004372171126306057,
          right_val: 0.299529105424881,
          left_val: -0.0468803010880947,
        },
        {
          features: [
            [15, 1, 3, 8, -1],
            [16, 1, 1, 8, 3],
          ],
          threshold: -0.014383009634912,
          right_val: 0.0341845192015171,
          left_val: -0.4546372890472412,
        },
        {
          features: [
            [11, 11, 2, 3, -1],
            [11, 12, 2, 1, 3],
          ],
          threshold: -0.003776380093768239,
          right_val: 0.0216847192496061,
          left_val: -0.5670902729034424,
        },
        {
          features: [
            [9, 9, 2, 4, -1],
            [9, 11, 2, 2, 2],
          ],
          threshold: -0.0034393940586596727,
          right_val: -0.0526400096714497,
          left_val: 0.2818368971347809,
        },
        {
          features: [
            [5, 9, 8, 4, -1],
            [5, 9, 4, 2, 2],
            [9, 11, 4, 2, 2],
          ],
          threshold: -0.0035846829414367676,
          right_val: 0.0522315204143524,
          left_val: -0.2922739982604981,
        },
        {
          features: [
            [9, 6, 2, 3, -1],
            [9, 7, 2, 1, 3],
          ],
          threshold: 0.003620075061917305,
          right_val: 0.2636413872241974,
          left_val: -0.0533787682652473,
        },
        {
          features: [
            [7, 9, 2, 3, -1],
            [7, 10, 2, 1, 3],
          ],
          threshold: 0.007643540855497122,
          right_val: -0.3924233913421631,
          left_val: 0.0368976294994354,
        },
        {
          features: [
            [11, 15, 4, 3, -1],
            [11, 16, 4, 1, 3],
          ],
          threshold: 0.003541782032698393,
          right_val: -0.3560107946395874,
          left_val: 0.0356899984180927,
        },
        {
          features: [
            [8, 6, 2, 3, -1],
            [8, 7, 2, 1, 3],
          ],
          threshold: -0.002404104918241501,
          right_val: -0.0892399623990059,
          left_val: 0.163130596280098,
        },
        {
          features: [
            [6, 8, 2, 3, -1],
            [6, 9, 2, 1, 3],
          ],
          threshold: 0.006547903176397085,
          right_val: -0.341876894235611,
          left_val: 0.0367087088525295,
        },
        {
          features: [
            [6, 9, 6, 3, -1],
            [8, 9, 2, 3, 3],
          ],
          threshold: -0.0123500004410744,
          right_val: -0.0524758212268353,
          left_val: 0.2615779936313629,
        },
        {
          features: [
            [6, 9, 4, 2, -1],
            [6, 9, 2, 1, 2],
            [8, 10, 2, 1, 2],
          ],
          threshold: 0.00001472650001232978,
          right_val: 0.0778074637055397,
          left_val: -0.1786914020776749,
        },
        {
          features: [
            [4, 7, 9, 1, -1],
            [7, 7, 3, 1, 3],
          ],
          threshold: -0.0215636193752289,
          right_val: 0.0190501995384693,
          left_val: -0.6392611861228943,
        },
        {
          features: [
            [5, 7, 2, 6, -1],
            [5, 7, 1, 3, 2],
            [6, 10, 1, 3, 2],
          ],
          threshold: 0.005076248198747635,
          right_val: 0.2912625074386597,
          left_val: -0.0516654811799526,
        },
        {
          features: [
            [4, 8, 4, 8, -1],
            [4, 12, 4, 4, 2],
          ],
          threshold: -0.0595319494605064,
          right_val: 0.0202382300049067,
          left_val: -0.7529155015945435,
        },
        {
          features: [
            [7, 0, 2, 19, -1],
            [8, 0, 1, 19, 2],
          ],
          threshold: -0.0168084893375635,
          right_val: 0.0259977299720049,
          left_val: -0.4283326864242554,
        },
        {
          features: [
            [5, 9, 1, 3, -1],
            [5, 10, 1, 1, 3],
          ],
          threshold: 0.003443168941885233,
          right_val: 0.2423350065946579,
          left_val: -0.0549125708639622,
        },
        {
          features: [
            [9, 5, 3, 1, -1],
            [10, 5, 1, 1, 3],
          ],
          threshold: -0.0010451589478179812,
          right_val: 0.0457485690712929,
          left_val: -0.2624354064464569,
        },
        {
          features: [
            [16, 4, 3, 6, -1],
            [16, 6, 3, 2, 3],
          ],
          threshold: -0.00048333409358747303,
          right_val: -0.1289211064577103,
          left_val: 0.0897919535636902,
        },
        {
          features: [
            [10, 15, 5, 3, -1],
            [10, 16, 5, 1, 3],
          ],
          threshold: -0.004757596179842949,
          right_val: 0.0360205285251141,
          left_val: -0.3186874091625214,
        },
        {
          features: [
            [13, 1, 5, 14, -1],
            [13, 8, 5, 7, 2],
          ],
          threshold: -0.1040714979171753,
          right_val: -0.0235981196165085,
          left_val: 0.5139874219894409,
        },
        {
          features: [
            [3, 0, 4, 4, -1],
            [3, 0, 2, 2, 2],
            [5, 2, 2, 2, 2],
          ],
          threshold: 0.009629265405237675,
          right_val: 0.2179042994976044,
          left_val: -0.0479655787348747,
        },
        {
          features: [
            [6, 5, 4, 13, -1],
            [8, 5, 2, 13, 2],
          ],
          threshold: 0.005922643002122641,
          right_val: -0.1821085959672928,
          left_val: 0.0642751306295395,
        },
        {
          features: [
            [4, 2, 2, 16, -1],
            [4, 2, 1, 8, 2],
            [5, 10, 1, 8, 2],
          ],
          threshold: 0.0169437993317842,
          right_val: 0.3145883083343506,
          left_val: -0.037509348243475,
        },
        {
          features: [
            [4, 8, 8, 3, -1],
            [8, 8, 4, 3, 2],
          ],
          threshold: -0.006546834949404001,
          right_val: 0.0905207470059395,
          left_val: -0.1581242978572846,
        },
        {
          features: [
            [5, 6, 2, 12, -1],
            [5, 12, 2, 6, 2],
          ],
          threshold: 0.009475486353039742,
          right_val: -0.2785384953022003,
          left_val: 0.04899587854743,
        },
        {
          features: [
            [8, 7, 2, 4, -1],
            [9, 7, 1, 4, 2],
          ],
          threshold: -0.004925447981804609,
          right_val: -0.0456094704568386,
          left_val: 0.3190219104290009,
        },
        {
          features: [
            [13, 9, 5, 4, -1],
            [13, 11, 5, 2, 2],
          ],
          threshold: -0.0009419954149052501,
          right_val: 0.0739662274718285,
          left_val: -0.1647298932075501,
        },
        {
          features: [
            [12, 0, 8, 2, -1],
            [12, 0, 4, 1, 2],
            [16, 1, 4, 1, 2],
          ],
          threshold: 0.007004665210843086,
          right_val: 0.3384662866592407,
          left_val: -0.036342341452837,
        },
        {
          features: [
            [14, 0, 6, 4, -1],
            [14, 0, 3, 2, 2],
            [17, 2, 3, 2, 2],
          ],
          threshold: -0.0009148329845629632,
          right_val: -0.1120643988251686,
          left_val: 0.1046098992228508,
        },
        {
          features: [
            [4, 9, 6, 2, -1],
            [6, 9, 2, 2, 3],
          ],
          threshold: -0.00018404760339763016,
          right_val: -0.0876273736357689,
          left_val: 0.1421570926904678,
        },
        {
          features: [
            [13, 1, 2, 1, -1],
            [14, 1, 1, 1, 2],
          ],
          threshold: -0.0003169252013321966,
          right_val: 0.070096842944622,
          left_val: -0.160678505897522,
        },
        {
          features: [
            [0, 0, 12, 3, -1],
            [6, 0, 6, 3, 2],
          ],
          threshold: 0.0231080092489719,
          right_val: 0.2078001946210861,
          left_val: -0.0537845008075237,
        },
        {
          features: [
            [5, 12, 3, 3, -1],
            [6, 12, 1, 3, 3],
          ],
          threshold: 0.0063212551176548,
          right_val: -0.3837850093841553,
          left_val: 0.0293422397226095,
        },
        {
          features: [
            [5, 11, 4, 3, -1],
            [5, 12, 4, 1, 3],
          ],
          threshold: 0.0073698158375918865,
          right_val: 0.2652654945850372,
          left_val: -0.041625689715147,
        },
        {
          features: [
            [5, 13, 2, 4, -1],
            [5, 13, 1, 2, 2],
            [6, 15, 1, 2, 2],
          ],
          threshold: 0.0033730969298630953,
          right_val: -0.30138298869133,
          left_val: 0.0377533212304115,
        },
        {
          features: [
            [4, 11, 3, 3, -1],
            [4, 12, 3, 1, 3],
          ],
          threshold: -0.006401695776730776,
          right_val: -0.0545513406395912,
          left_val: 0.2183986008167267,
        },
        {
          features: [
            [1, 8, 6, 2, -1],
            [1, 9, 6, 1, 2],
          ],
          threshold: 0.0135539202019572,
          right_val: -0.4360117018222809,
          left_val: 0.0281212609261274,
        },
        {
          features: [
            [6, 8, 4, 12, -1],
            [6, 12, 4, 4, 3],
          ],
          threshold: -0.006763629149645567,
          right_val: 0.0673396587371826,
          left_val: -0.1632225066423416,
        },
        {
          features: [
            [7, 14, 6, 4, -1],
            [7, 14, 3, 2, 2],
            [10, 16, 3, 2, 2],
          ],
          threshold: -0.0013078070478513837,
          right_val: -0.1009631976485252,
          left_val: 0.1231539994478226,
        },
        {
          features: [
            [8, 16, 8, 4, -1],
            [8, 16, 4, 2, 2],
            [12, 18, 4, 2, 2],
          ],
          threshold: -0.007628236897289753,
          right_val: -0.0504607111215591,
          left_val: 0.2516534924507141,
        },
        {
          features: [
            [5, 10, 10, 6, -1],
            [5, 12, 10, 2, 3],
          ],
          threshold: 0.007999439723789692,
          right_val: -0.1887779980897903,
          left_val: 0.0730206519365311,
        },
        {
          features: [
            [6, 13, 1, 3, -1],
            [6, 14, 1, 1, 3],
          ],
          threshold: -0.0031321209389716387,
          right_val: -0.0432768389582634,
          left_val: 0.276531994342804,
        },
        {
          features: [
            [3, 11, 4, 6, -1],
            [3, 13, 4, 2, 3],
          ],
          threshold: -0.0409313105046749,
          right_val: 0.0186009202152491,
          left_val: -0.6551824808120728,
        },
        {
          features: [
            [10, 14, 6, 3, -1],
            [10, 15, 6, 1, 3],
          ],
          threshold: 0.0070344978012144566,
          right_val: -0.4859581887722015,
          left_val: 0.0219147708266974,
        },
        {
          features: [
            [3, 15, 4, 2, -1],
            [5, 15, 2, 2, 2],
          ],
          threshold: -0.0025299859698861837,
          right_val: -0.0805664733052254,
          left_val: 0.1403076946735382,
        },
        {
          features: [
            [3, 14, 4, 3, -1],
            [5, 14, 2, 3, 2],
          ],
          threshold: 0.003886789083480835,
          right_val: 0.1683240979909897,
          left_val: -0.0890756994485855,
        },
        {
          features: [
            [1, 2, 1, 2, -1],
            [1, 3, 1, 1, 2],
          ],
          threshold: 0.00038210590719245374,
          right_val: -0.1859952956438065,
          left_val: 0.0652008727192879,
        },
        {
          features: [
            [0, 12, 8, 4, -1],
            [4, 12, 4, 4, 2],
          ],
          threshold: 0.1095478981733322,
          right_val: -0.86908358335495,
          left_val: 0.0150360204279423,
        },
        {
          features: [
            [1, 2, 1, 2, -1],
            [1, 3, 1, 1, 2],
          ],
          threshold: -0.00014177490083966404,
          right_val: 0.0790501534938812,
          left_val: -0.14669269323349,
        },
        {
          features: [
            [5, 11, 1, 3, -1],
            [5, 12, 1, 1, 3],
          ],
          threshold: 0.0020990408957004547,
          right_val: 0.2304524928331375,
          left_val: -0.0464896783232689,
        },
        {
          features: [
            [10, 19, 2, 1, -1],
            [11, 19, 1, 1, 2],
          ],
          threshold: -0.00023089480237104,
          right_val: 0.0697731003165245,
          left_val: -0.1678400933742523,
        },
        {
          features: [
            [6, 6, 4, 4, -1],
            [6, 6, 2, 2, 2],
            [8, 8, 2, 2, 2],
          ],
          threshold: -0.00043103471398353577,
          right_val: -0.1293924003839493,
          left_val: 0.0817587599158287,
        },
        {
          features: [
            [6, 3, 1, 2, -1],
            [6, 4, 1, 1, 2],
          ],
          threshold: -0.00029572288622148335,
          right_val: 0.058420080691576,
          left_val: -0.1906823068857193,
        },
        {
          features: [
            [0, 4, 10, 2, -1],
            [5, 4, 5, 2, 2],
          ],
          threshold: -0.00400460185483098,
          right_val: -0.081599622964859,
          left_val: 0.1294852942228317,
        },
        {
          features: [
            [4, 5, 2, 1, -1],
            [5, 5, 1, 1, 2],
          ],
          threshold: 0.000014935520084691234,
          right_val: 0.0986640229821205,
          left_val: -0.1336472034454346,
        },
        {
          features: [
            [0, 12, 2, 1, -1],
            [1, 12, 1, 1, 2],
          ],
          threshold: 0.0005782445077784359,
          right_val: -0.1831808984279633,
          left_val: 0.0590956397354603,
        },
        {
          features: [
            [1, 4, 6, 11, -1],
            [3, 4, 2, 11, 3],
          ],
          threshold: 0.0132513204589486,
          right_val: 0.1563598960638046,
          left_val: -0.0714886710047722,
        },
        {
          features: [
            [6, 4, 2, 1, -1],
            [7, 4, 1, 1, 2],
          ],
          threshold: 0.000007127356184355449,
          right_val: 0.0977525115013123,
          left_val: -0.1228308975696564,
        },
        {
          features: [
            [7, 0, 1, 6, -1],
            [7, 2, 1, 2, 3],
          ],
          threshold: 0.0014193489914759994,
          right_val: 0.137015700340271,
          left_val: -0.0816967487335205,
        },
        {
          features: [
            [7, 0, 8, 4, -1],
            [7, 2, 8, 2, 2],
          ],
          threshold: -0.008016541600227356,
          right_val: -0.0565270408987999,
          left_val: 0.2469722926616669,
        },
        {
          features: [
            [13, 6, 2, 2, -1],
            [13, 7, 2, 1, 2],
          ],
          threshold: -0.0023803471121937037,
          right_val: 0.0345325507223606,
          left_val: -0.3790158927440643,
        },
        {
          features: [
            [16, 15, 2, 2, -1],
            [16, 15, 1, 1, 2],
            [17, 16, 1, 1, 2],
          ],
          threshold: -0.004863373003900051,
          right_val: -0.0192961990833282,
          left_val: 0.6544101238250732,
        },
        {
          features: [
            [11, 12, 1, 2, -1],
            [11, 13, 1, 1, 2],
          ],
          threshold: -0.000014388219824468251,
          right_val: -0.1439446061849594,
          left_val: 0.0751018822193146,
        },
        {
          features: [
            [4, 4, 5, 2, -1],
            [4, 5, 5, 1, 2],
          ],
          threshold: 0.00001479878028476378,
          right_val: 0.096213810145855,
          left_val: -0.1080738976597786,
        },
        {
          features: [
            [4, 3, 3, 9, -1],
            [4, 6, 3, 3, 3],
          ],
          threshold: 0.0241761393845081,
          right_val: -0.4070847928524017,
          left_val: 0.026983680203557,
        },
        {
          features: [
            [6, 7, 2, 3, -1],
            [7, 7, 1, 3, 2],
          ],
          threshold: -0.0039851912297308445,
          right_val: -0.0541703104972839,
          left_val: 0.2178670018911362,
        },
        {
          features: [
            [4, 8, 6, 1, -1],
            [7, 8, 3, 1, 2],
          ],
          threshold: -0.0025377580896019936,
          right_val: 0.088059239089489,
          left_val: -0.1531459987163544,
        },
        {
          features: [
            [3, 8, 12, 5, -1],
            [9, 8, 6, 5, 2],
          ],
          threshold: 0.0021663319785147905,
          right_val: -0.1203925013542175,
          left_val: 0.1025272011756897,
        },
        {
          features: [
            [9, 8, 1, 3, -1],
            [9, 9, 1, 1, 3],
          ],
          threshold: 0.0003559392935130745,
          right_val: 0.1322889029979706,
          left_val: -0.0822677686810493,
        },
        {
          features: [
            [9, 9, 6, 1, -1],
            [12, 9, 3, 1, 2],
          ],
          threshold: 0.0011394560569897294,
          right_val: 0.1569389998912811,
          left_val: -0.0863934904336929,
        },
        {
          features: [
            [13, 7, 7, 6, -1],
            [13, 9, 7, 2, 3],
          ],
          threshold: 0.0555638186633587,
          right_val: -0.7047374248504639,
          left_val: 0.0171081107109785,
        },
        {
          features: [
            [0, 2, 20, 18, -1],
            [10, 2, 10, 18, 2],
          ],
          threshold: 0.5551459193229675,
          right_val: -0.6991689205169678,
          left_val: 0.0133453896269202,
        },
        {
          features: [
            [12, 5, 6, 3, -1],
            [12, 6, 6, 1, 3],
          ],
          threshold: -0.004623549059033394,
          right_val: 0.0395153500139713,
          left_val: -0.239836797118187,
        },
        {
          features: [
            [8, 8, 3, 2, -1],
            [8, 9, 3, 1, 2],
          ],
          threshold: -0.0045803869143128395,
          right_val: -0.0264305397868156,
          left_val: 0.4290086925029755,
        },
        {
          features: [
            [4, 9, 11, 6, -1],
            [4, 11, 11, 2, 3],
          ],
          threshold: 0.007085131946951151,
          right_val: -0.1071150973439217,
          left_val: 0.1123107969760895,
        },
        {
          features: [
            [7, 7, 7, 6, -1],
            [7, 10, 7, 3, 2],
          ],
          threshold: -0.0004052481090184301,
          right_val: 0.0466700196266174,
          left_val: -0.2574095129966736,
        },
        {
          features: [
            [15, 7, 2, 8, -1],
            [15, 7, 1, 4, 2],
            [16, 11, 1, 4, 2],
          ],
          threshold: -0.004912153817713261,
          right_val: -0.0439662411808968,
          left_val: 0.2712928056716919,
        },
        {
          features: [
            [4, 10, 2, 6, -1],
            [4, 12, 2, 2, 3],
          ],
          threshold: -0.0193480998277664,
          right_val: 0.0291767697781324,
          left_val: -0.4064385890960693,
        },
        {
          features: [
            [7, 13, 2, 2, -1],
            [7, 13, 1, 1, 2],
            [8, 14, 1, 1, 2],
          ],
          threshold: -0.0013842330081388354,
          right_val: -0.0502275489270687,
          left_val: 0.2353720963001251,
        },
        {
          features: [
            [7, 2, 3, 4, -1],
            [8, 2, 1, 4, 3],
          ],
          threshold: 0.006275259889662266,
          right_val: -0.3991320133209229,
          left_val: 0.0281135700643063,
        },
        {
          features: [
            [7, 3, 2, 3, -1],
            [8, 3, 1, 3, 2],
          ],
          threshold: 0.000014853129869152326,
          right_val: 0.1020639017224312,
          left_val: -0.1075062975287437,
        },
        {
          features: [
            [5, 9, 3, 1, -1],
            [6, 9, 1, 1, 3],
          ],
          threshold: -0.0011780710192397237,
          right_val: -0.0589980408549309,
          left_val: 0.1811279058456421,
        },
        {
          features: [
            [14, 6, 3, 8, -1],
            [15, 6, 1, 8, 3],
          ],
          threshold: -0.0321663916110992,
          right_val: 0.0118171395733953,
          left_val: -0.9813510179519653,
        },
        {
          features: [
            [4, 10, 2, 6, -1],
            [4, 13, 2, 3, 2],
          ],
          threshold: 0.002874908037483692,
          right_val: -0.2065003961324692,
          left_val: 0.0507743693888187,
        },
        {
          features: [
            [0, 17, 10, 3, -1],
            [0, 18, 10, 1, 3],
          ],
          threshold: -0.003509816015139222,
          right_val: -0.078006736934185,
          left_val: 0.1435403972864151,
        },
        {
          features: [
            [5, 18, 7, 2, -1],
            [5, 19, 7, 1, 2],
          ],
          threshold: -0.007220362778753042,
          right_val: -0.0461761802434921,
          left_val: 0.2385395020246506,
        },
        {
          features: [
            [13, 12, 1, 3, -1],
            [13, 13, 1, 1, 3],
          ],
          threshold: 0.0020837699994444847,
          right_val: -0.509456217288971,
          left_val: 0.022801460698247,
        },
        {
          features: [
            [9, 2, 4, 16, -1],
            [9, 2, 2, 8, 2],
            [11, 10, 2, 8, 2],
          ],
          threshold: 0.036175400018692,
          right_val: -0.6134936213493347,
          left_val: 0.0147347403690219,
        },
        {
          features: [
            [6, 7, 2, 3, -1],
            [6, 8, 2, 1, 3],
          ],
          threshold: 0.007554575800895691,
          right_val: -0.5886300802230835,
          left_val: 0.0161661300808191,
        },
        {
          features: [
            [9, 8, 2, 4, -1],
            [9, 10, 2, 2, 2],
          ],
          threshold: -0.002605895046144724,
          right_val: -0.0346243008971214,
          left_val: 0.3643600940704346,
        },
        {
          features: [
            [18, 4, 2, 3, -1],
            [18, 5, 2, 1, 3],
          ],
          threshold: 0.0006466935155913234,
          right_val: -0.1895352005958557,
          left_val: 0.0634447336196899,
        },
        {
          features: [
            [16, 10, 2, 2, -1],
            [16, 10, 1, 1, 2],
            [17, 11, 1, 1, 2],
          ],
          threshold: -0.0031747641041874886,
          right_val: -0.0269687902182341,
          left_val: 0.4287785887718201,
        },
        {
          features: [
            [14, 2, 6, 6, -1],
            [14, 4, 6, 2, 3],
          ],
          threshold: -0.0238397307693958,
          right_val: 0.0336885005235672,
          left_val: -0.3687137067317963,
        },
        {
          features: [
            [16, 11, 3, 1, -1],
            [17, 11, 1, 1, 3],
          ],
          threshold: 0.001197364996187389,
          right_val: 0.1917916983366013,
          left_val: -0.0628985092043877,
        },
        {
          features: [
            [17, 10, 2, 1, -1],
            [18, 10, 1, 1, 2],
          ],
          threshold: 0.00004459392948774621,
          right_val: 0.1215995997190476,
          left_val: -0.1102266013622284,
        },
        {
          features: [
            [16, 8, 2, 4, -1],
            [17, 8, 1, 4, 2],
          ],
          threshold: 0.009157590568065643,
          right_val: -0.4992873072624207,
          left_val: 0.0253538899123669,
        },
        {
          features: [
            [11, 15, 6, 3, -1],
            [11, 16, 6, 1, 3],
          ],
          threshold: 0.002393346978351474,
          right_val: -0.2268545031547546,
          left_val: 0.0482820905745029,
        },
        {
          features: [
            [3, 7, 3, 4, -1],
            [4, 7, 1, 4, 3],
          ],
          threshold: -0.0011994830565527081,
          right_val: -0.1066953986883164,
          left_val: 0.1088657006621361,
        },
        {
          features: [
            [3, 5, 3, 5, -1],
            [4, 5, 1, 5, 3],
          ],
          threshold: 0.0021603968925774097,
          right_val: 0.1650795936584473,
          left_val: -0.0760766267776489,
        },
        {
          features: [
            [2, 10, 6, 1, -1],
            [5, 10, 3, 1, 2],
          ],
          threshold: -0.0165563393384218,
          right_val: 0.0207116492092609,
          left_val: -0.5416721105575562,
        },
        {
          features: [
            [12, 0, 4, 2, -1],
            [14, 0, 2, 2, 2],
          ],
          threshold: -0.008835026994347572,
          right_val: 0.0288704000413418,
          left_val: -0.367109090089798,
        },
        {
          features: [
            [9, 14, 1, 2, -1],
            [9, 15, 1, 1, 2],
          ],
          threshold: -0.00001459239956602687,
          right_val: -0.1362261027097702,
          left_val: 0.0787240713834763,
        },
        {
          features: [
            [15, 12, 5, 6, -1],
            [15, 14, 5, 2, 3],
          ],
          threshold: -0.0014897900400683284,
          right_val: -0.1010489985346794,
          left_val: 0.1143611967563629,
        },
        {
          features: [
            [4, 13, 10, 4, -1],
            [4, 15, 10, 2, 2],
          ],
          threshold: -0.0039764028042554855,
          right_val: 0.1046606004238129,
          left_val: -0.1025056019425392,
        },
        {
          features: [
            [7, 16, 6, 4, -1],
            [7, 16, 3, 2, 2],
            [10, 18, 3, 2, 2],
          ],
          threshold: -0.007265704218298197,
          right_val: -0.045155581086874,
          left_val: 0.2298226952552795,
        },
        {
          features: [
            [9, 16, 7, 3, -1],
            [9, 17, 7, 1, 3],
          ],
          threshold: 0.008911502547562122,
          right_val: -0.4423500895500183,
          left_val: 0.029681159183383,
        },
        {
          features: [
            [4, 8, 2, 2, -1],
            [4, 8, 1, 1, 2],
            [5, 9, 1, 1, 2],
          ],
          threshold: -0.0018145949579775333,
          right_val: -0.0468561202287674,
          left_val: 0.2391141951084137,
        },
        {
          features: [
            [0, 17, 20, 2, -1],
            [10, 17, 10, 2, 2],
          ],
          threshold: -0.0375463217496872,
          right_val: 0.0615337491035461,
          left_val: -0.1856968998908997,
        },
        {
          features: [
            [4, 8, 3, 1, -1],
            [5, 8, 1, 1, 3],
          ],
          threshold: -0.0010010029654949903,
          right_val: -0.0869904831051826,
          left_val: 0.1436135023832321,
        },
        {
          features: [
            [4, 7, 2, 6, -1],
            [4, 7, 1, 3, 2],
            [5, 10, 1, 3, 2],
          ],
          threshold: -0.0037357229739427567,
          right_val: -0.0611675307154655,
          left_val: 0.2024545967578888,
        },
        {
          features: [
            [11, 11, 1, 2, -1],
            [11, 12, 1, 1, 2],
          ],
          threshold: -0.00001467201036575716,
          right_val: -0.1303700953722,
          left_val: 0.0881808698177338,
        },
        {
          features: [
            [10, 13, 5, 2, -1],
            [10, 14, 5, 1, 2],
          ],
          threshold: 0.00009437971311854199,
          right_val: -0.2002536952495575,
          left_val: 0.055626530200243,
        },
        {
          features: [
            [8, 16, 3, 3, -1],
            [8, 17, 3, 1, 3],
          ],
          threshold: 0.00015706509293522686,
          right_val: 0.1151885017752647,
          left_val: -0.0983358770608902,
        },
        {
          features: [
            [9, 18, 3, 1, -1],
            [10, 18, 1, 1, 3],
          ],
          threshold: -0.0008181005832739174,
          right_val: 0.05288041010499,
          left_val: -0.2170155048370361,
        },
        {
          features: [
            [8, 6, 11, 12, -1],
            [8, 10, 11, 4, 3],
          ],
          threshold: -0.0516892597079277,
          right_val: -0.0187611002475023,
          left_val: 0.5771527886390686,
        },
        {
          features: [
            [2, 4, 13, 12, -1],
            [2, 10, 13, 6, 2],
          ],
          threshold: -0.0907194092869759,
          right_val: 0.036741130053997,
          left_val: -0.3627884984016419,
        },
        {
          features: [
            [0, 15, 10, 4, -1],
            [0, 15, 5, 2, 2],
            [5, 17, 5, 2, 2],
          ],
          threshold: -0.0109590403735638,
          right_val: -0.0697256475687027,
          left_val: 0.1678718030452728,
        },
        {
          features: [
            [4, 8, 6, 2, -1],
            [7, 8, 3, 2, 2],
          ],
          threshold: 0.0037122920621186495,
          right_val: -0.2056706994771957,
          left_val: 0.0603603087365627,
        },
        {
          features: [
            [10, 1, 6, 2, -1],
            [12, 1, 2, 2, 3],
          ],
          threshold: -0.0193157307803631,
          right_val: 0.0197053197771311,
          left_val: -0.5739740133285522,
        },
        {
          features: [
            [7, 8, 6, 7, -1],
            [9, 8, 2, 7, 3],
          ],
          threshold: -0.0270511899143457,
          right_val: -0.0360842905938625,
          left_val: 0.3498320877552033,
        },
        {
          features: [
            [9, 9, 6, 2, -1],
            [11, 9, 2, 2, 3],
          ],
          threshold: 0.0217429101467133,
          right_val: -0.6531919836997986,
          left_val: 0.0227670799940825,
        },
        {
          features: [
            [3, 14, 15, 4, -1],
            [8, 14, 5, 4, 3],
          ],
          threshold: 0.0996085926890373,
          right_val: 0.3827111124992371,
          left_val: -0.0312595590949059,
        },
        {
          features: [
            [7, 3, 2, 14, -1],
            [7, 10, 2, 7, 2],
          ],
          threshold: 0.004651783965528011,
          right_val: -0.1239601969718933,
          left_val: 0.1008803024888039,
        },
        {
          features: [
            [11, 14, 1, 2, -1],
            [11, 15, 1, 1, 2],
          ],
          threshold: -0.000014784580343984999,
          right_val: -0.155730202794075,
          left_val: 0.0796834826469421,
        },
        {
          features: [
            [5, 11, 1, 3, -1],
            [5, 12, 1, 1, 3],
          ],
          threshold: -0.0016718909610062838,
          right_val: -0.0677338093519211,
          left_val: 0.1707732975482941,
        },
        {
          features: [
            [11, 14, 3, 3, -1],
            [11, 15, 3, 1, 3],
          ],
          threshold: 0.000014456630196946207,
          right_val: 0.1111683025956154,
          left_val: -0.101060301065445,
        },
        {
          features: [
            [10, 7, 9, 4, -1],
            [13, 7, 3, 4, 3],
          ],
          threshold: -0.002708490937948227,
          right_val: -0.1088062971830368,
          left_val: 0.113127201795578,
        },
      ],
      threshold: -1.4741109609603882,
    },
    {
      simpleClassifiers: [
        {
          features: [
            [11, 6, 6, 5, -1],
            [14, 6, 3, 5, 2],
          ],
          threshold: -0.0226868595927954,
          right_val: -0.2735877931118012,
          left_val: 0.2731691002845764,
        },
        {
          features: [
            [8, 9, 1, 2, -1],
            [8, 10, 1, 1, 2],
          ],
          threshold: 0.00042952829971909523,
          right_val: 0.1574072986841202,
          left_val: -0.2510795891284943,
        },
        {
          features: [
            [16, 3, 1, 10, -1],
            [16, 8, 1, 5, 2],
          ],
          threshold: 0.0025115790776908398,
          right_val: 0.156602293252945,
          left_val: -0.2200254946947098,
        },
        {
          features: [
            [6, 11, 10, 4, -1],
            [6, 13, 10, 2, 2],
          ],
          threshold: -0.0006395889213308692,
          right_val: -0.3827897906303406,
          left_val: 0.0726099386811256,
        },
        {
          features: [
            [5, 7, 2, 2, -1],
            [6, 7, 1, 2, 2],
          ],
          threshold: 0.0026575280353426933,
          right_val: 0.234142392873764,
          left_val: -0.1152343973517418,
        },
        {
          features: [
            [1, 6, 6, 11, -1],
            [4, 6, 3, 11, 2],
          ],
          threshold: -0.0759164094924927,
          right_val: -0.082622267305851,
          left_val: 0.3251757919788361,
        },
        {
          features: [
            [6, 8, 3, 2, -1],
            [6, 9, 3, 1, 2],
          ],
          threshold: 0.000014966350136091933,
          right_val: 0.0523535907268524,
          left_val: -0.3564029037952423,
        },
        {
          features: [
            [10, 15, 1, 2, -1],
            [10, 16, 1, 1, 2],
          ],
          threshold: -0.000014678399566037115,
          right_val: -0.2245268970727921,
          left_val: 0.1019821986556053,
        },
        {
          features: [
            [8, 0, 12, 1, -1],
            [14, 0, 6, 1, 2],
          ],
          threshold: 0.00005231477916822769,
          right_val: 0.101070798933506,
          left_val: -0.1775784939527512,
        },
        {
          features: [
            [5, 3, 2, 2, -1],
            [6, 3, 1, 2, 2],
          ],
          threshold: 0.00014088390162214637,
          right_val: 0.138727605342865,
          left_val: -0.151397705078125,
        },
        {
          features: [
            [11, 6, 6, 5, -1],
            [14, 6, 3, 5, 2],
          ],
          threshold: -0.0234117899090052,
          right_val: 0.1070213988423348,
          left_val: -0.1643598973751068,
        },
        {
          features: [
            [6, 12, 3, 3, -1],
            [6, 13, 3, 1, 3],
          ],
          threshold: 0.002328465925529599,
          right_val: 0.223339706659317,
          left_val: -0.0809507295489311,
        },
        {
          features: [
            [10, 10, 3, 3, -1],
            [11, 10, 1, 3, 3],
          ],
          threshold: -0.0033611140679568052,
          right_val: 0.0344890393316746,
          left_val: -0.443299412727356,
        },
        {
          features: [
            [6, 13, 2, 2, -1],
            [6, 14, 2, 1, 2],
          ],
          threshold: 0.0005845897831022739,
          right_val: 0.1721502989530563,
          left_val: -0.1108347028493881,
        },
        {
          features: [
            [4, 2, 16, 8, -1],
            [12, 2, 8, 8, 2],
          ],
          threshold: -0.00033180968603119254,
          right_val: -0.2632124125957489,
          left_val: 0.0691525936126709,
        },
        {
          features: [
            [10, 12, 2, 2, -1],
            [10, 12, 1, 1, 2],
            [11, 13, 1, 1, 2],
          ],
          threshold: -0.0008851587772369385,
          right_val: 0.0432582013309002,
          left_val: -0.3476473093032837,
        },
        {
          features: [
            [10, 7, 2, 2, -1],
            [11, 7, 1, 2, 2],
          ],
          threshold: 0.00014169749920256436,
          right_val: 0.1014982014894486,
          left_val: -0.1460068970918655,
        },
        {
          features: [
            [13, 13, 1, 3, -1],
            [13, 14, 1, 1, 3],
          ],
          threshold: 0.0014851680025458336,
          right_val: -0.4178613126277924,
          left_val: 0.0299831703305244,
        },
        {
          features: [
            [13, 13, 2, 3, -1],
            [13, 14, 2, 1, 3],
          ],
          threshold: -0.0007532932795584202,
          right_val: 0.0645342096686363,
          left_val: -0.2155763953924179,
        },
        {
          features: [
            [1, 13, 6, 4, -1],
            [4, 13, 3, 4, 2],
          ],
          threshold: 0.0142605397850275,
          right_val: 0.1951199024915695,
          left_val: -0.0800133273005486,
        },
        {
          features: [
            [10, 13, 2, 1, -1],
            [11, 13, 1, 1, 2],
          ],
          threshold: -0.000014687920156575274,
          right_val: -0.1350235044956207,
          left_val: 0.0971216633915901,
        },
        {
          features: [
            [10, 6, 2, 10, -1],
            [10, 6, 1, 5, 2],
            [11, 11, 1, 5, 2],
          ],
          threshold: -0.009892507456243038,
          right_val: 0.0293358005583286,
          left_val: -0.510352611541748,
        },
        {
          features: [
            [16, 11, 2, 2, -1],
            [16, 11, 1, 1, 2],
            [17, 12, 1, 1, 2],
          ],
          threshold: -0.0018316040514037013,
          right_val: -0.0450140200555325,
          left_val: 0.3267607986927033,
        },
        {
          features: [
            [16, 12, 3, 1, -1],
            [17, 12, 1, 1, 3],
          ],
          threshold: 0.0008649557712487876,
          right_val: 0.1876493990421295,
          left_val: -0.0778365135192871,
        },
        {
          features: [
            [9, 5, 7, 12, -1],
            [9, 9, 7, 4, 3],
          ],
          threshold: 0.1490266025066376,
          right_val: -0.6245067715644836,
          left_val: 0.0195689909160137,
        },
        {
          features: [
            [4, 1, 10, 18, -1],
            [4, 1, 5, 9, 2],
            [9, 10, 5, 9, 2],
          ],
          threshold: -0.0171267203986645,
          right_val: 0.0730486810207367,
          left_val: -0.1814144998788834,
        },
        {
          features: [
            [17, 12, 2, 2, -1],
            [17, 12, 1, 1, 2],
            [18, 13, 1, 1, 2],
          ],
          threshold: -0.0017061959952116013,
          right_val: -0.0441520288586617,
          left_val: 0.3123683929443359,
        },
        {
          features: [
            [12, 5, 6, 2, -1],
            [12, 6, 6, 1, 2],
          ],
          threshold: 0.003826180938631296,
          right_val: -0.2933003008365631,
          left_val: 0.0515185296535492,
        },
        {
          features: [
            [4, 7, 5, 2, -1],
            [4, 8, 5, 1, 2],
          ],
          threshold: 0.003809367073699832,
          right_val: 0.1757443994283676,
          left_val: -0.0767072066664696,
        },
        {
          features: [
            [7, 3, 1, 2, -1],
            [7, 4, 1, 1, 2],
          ],
          threshold: -0.00034228331060148776,
          right_val: 0.0617266409099102,
          left_val: -0.2345802038908005,
        },
        {
          features: [
            [6, 0, 7, 6, -1],
            [6, 3, 7, 3, 2],
          ],
          threshold: -0.04169787093997,
          right_val: -0.0368928201496601,
          left_val: 0.4392912983894348,
        },
        {
          features: [
            [13, 11, 2, 8, -1],
            [13, 11, 1, 4, 2],
            [14, 15, 1, 4, 2],
          ],
          threshold: 0.00019080520723946393,
          right_val: 0.0971686616539955,
          left_val: -0.1348893940448761,
        },
        {
          features: [
            [8, 7, 4, 2, -1],
            [10, 7, 2, 2, 2],
          ],
          threshold: 0.0002640071033965796,
          right_val: 0.0732702314853668,
          left_val: -0.165395200252533,
        },
        {
          features: [
            [4, 1, 2, 4, -1],
            [4, 1, 1, 2, 2],
            [5, 3, 1, 2, 2],
          ],
          threshold: 0.007983916439116001,
          right_val: 0.3653585910797119,
          left_val: -0.0335273407399654,
        },
        {
          features: [
            [4, 0, 2, 8, -1],
            [4, 0, 1, 4, 2],
            [5, 4, 1, 4, 2],
          ],
          threshold: -0.0142674101516604,
          right_val: -0.0271544195711613,
          left_val: 0.4673924148082733,
        },
        {
          features: [
            [6, 3, 2, 1, -1],
            [7, 3, 1, 1, 2],
          ],
          threshold: -0.00009472607052884996,
          right_val: 0.0876573026180267,
          left_val: -0.1501774936914444,
        },
        {
          features: [
            [14, 12, 1, 3, -1],
            [14, 13, 1, 1, 3],
          ],
          threshold: -0.0002962927974294871,
          right_val: 0.0738632306456566,
          left_val: -0.1619454026222229,
        },
        {
          features: [
            [5, 10, 2, 3, -1],
            [5, 11, 2, 1, 3],
          ],
          threshold: 0.0023301010951399803,
          right_val: 0.1577855050563812,
          left_val: -0.0799251571297646,
        },
        {
          features: [
            [5, 11, 2, 2, -1],
            [5, 12, 2, 1, 2],
          ],
          threshold: 0.00036623800406232476,
          right_val: 0.2049566954374313,
          left_val: -0.0870193466544151,
        },
        {
          features: [
            [5, 1, 4, 15, -1],
            [5, 6, 4, 5, 3],
          ],
          threshold: -0.0444996692240238,
          right_val: 0.0456480011343956,
          left_val: -0.2989141047000885,
        },
        {
          features: [
            [11, 5, 4, 14, -1],
            [11, 5, 2, 7, 2],
            [13, 12, 2, 7, 2],
          ],
          threshold: -0.006076870020478964,
          right_val: -0.0535807088017464,
          left_val: 0.2374615073204041,
        },
        {
          features: [
            [9, 18, 3, 1, -1],
            [10, 18, 1, 1, 3],
          ],
          threshold: 0.0006606486276723444,
          right_val: -0.2356991022825241,
          left_val: 0.059221439063549,
        },
        {
          features: [
            [4, 10, 5, 6, -1],
            [4, 12, 5, 2, 3],
          ],
          threshold: 0.007469926029443741,
          right_val: -0.23386649787426,
          left_val: 0.0513040497899055,
        },
        {
          features: [
            [5, 13, 3, 3, -1],
            [5, 14, 3, 1, 3],
          ],
          threshold: -0.006712802220135927,
          right_val: -0.0500311218202114,
          left_val: 0.2706164121627808,
        },
        {
          features: [
            [8, 1, 3, 5, -1],
            [9, 1, 1, 5, 3],
          ],
          threshold: 0.004658997058868408,
          right_val: -0.3073048889636993,
          left_val: 0.0449322015047073,
        },
        {
          features: [
            [4, 7, 3, 2, -1],
            [5, 7, 1, 2, 3],
          ],
          threshold: 0.004981520120054483,
          right_val: 0.2685301005840302,
          left_val: -0.0482554100453854,
        },
        {
          features: [
            [6, 14, 3, 3, -1],
            [7, 14, 1, 3, 3],
          ],
          threshold: 0.00992441363632679,
          right_val: -0.7035238742828369,
          left_val: 0.0194467697292566,
        },
        {
          features: [
            [7, 13, 2, 3, -1],
            [7, 14, 2, 1, 3],
          ],
          threshold: 0.006198840215802193,
          right_val: 0.3546040058135986,
          left_val: -0.0351072698831558,
        },
        {
          features: [
            [4, 3, 2, 9, -1],
            [4, 6, 2, 3, 3],
          ],
          threshold: 0.008843336254358292,
          right_val: -0.2748593091964722,
          left_val: 0.0453283898532391,
        },
        {
          features: [
            [4, 8, 3, 2, -1],
            [4, 9, 3, 1, 2],
          ],
          threshold: 0.0111105600371957,
          right_val: -0.5017204284667969,
          left_val: 0.0223914198577404,
        },
        {
          features: [
            [10, 10, 2, 2, -1],
            [10, 11, 2, 1, 2],
          ],
          threshold: -0.0006940881139598787,
          right_val: -0.0638494268059731,
          left_val: 0.1707949042320252,
        },
        {
          features: [
            [7, 8, 12, 6, -1],
            [7, 8, 6, 3, 2],
            [13, 11, 6, 3, 2],
          ],
          threshold: 0.008037703111767769,
          right_val: -0.1641612946987152,
          left_val: 0.0889374613761902,
        },
        {
          features: [
            [14, 10, 3, 2, -1],
            [14, 11, 3, 1, 2],
          ],
          threshold: 0.000014750069567526225,
          right_val: 0.0969811230897903,
          left_val: -0.1371303051710129,
        },
        {
          features: [
            [5, 16, 6, 2, -1],
            [5, 17, 6, 1, 2],
          ],
          threshold: 0.0012381490087136626,
          right_val: 0.1655137985944748,
          left_val: -0.0694912225008011,
        },
        {
          features: [
            [8, 15, 4, 3, -1],
            [8, 16, 4, 1, 3],
          ],
          threshold: 0.0002658414887264371,
          right_val: 0.1202037036418915,
          left_val: -0.0968036130070686,
        },
        {
          features: [
            [14, 9, 2, 2, -1],
            [14, 10, 2, 1, 2],
          ],
          threshold: -0.0005407665157690644,
          right_val: 0.0489878505468369,
          left_val: -0.231853798031807,
        },
        {
          features: [
            [8, 5, 2, 3, -1],
            [8, 6, 2, 1, 3],
          ],
          threshold: -0.005109280813485384,
          right_val: -0.0408004708588123,
          left_val: 0.3039175868034363,
        },
        {
          features: [
            [8, 5, 3, 3, -1],
            [8, 6, 3, 1, 3],
          ],
          threshold: 0.0015575919533148408,
          right_val: 0.1446592956781387,
          left_val: -0.101509802043438,
        },
        {
          features: [
            [1, 7, 17, 9, -1],
            [1, 10, 17, 3, 3],
          ],
          threshold: 0.0283960197120905,
          right_val: -0.0883143097162247,
          left_val: 0.1509854048490524,
        },
        {
          features: [
            [5, 10, 6, 8, -1],
            [5, 14, 6, 4, 2],
          ],
          threshold: 0.0015096530551090837,
          right_val: -0.2619952857494354,
          left_val: 0.0515897385776043,
        },
        {
          features: [
            [18, 1, 2, 2, -1],
            [18, 1, 1, 1, 2],
            [19, 2, 1, 1, 2],
          ],
          threshold: 0.0014308419777080417,
          right_val: 0.2758454084396362,
          left_val: -0.0454978495836258,
        },
        {
          features: [
            [0, 0, 11, 6, -1],
            [0, 3, 11, 3, 2],
          ],
          threshold: 0.1303036957979202,
          right_val: -0.5749182105064392,
          left_val: 0.0203299894928932,
        },
        {
          features: [
            [3, 0, 16, 3, -1],
            [3, 1, 16, 1, 3],
          ],
          threshold: -0.0033548770006746054,
          right_val: -0.0899374112486839,
          left_val: 0.1228995025157929,
        },
        {
          features: [
            [10, 10, 10, 3, -1],
            [10, 11, 10, 1, 3],
          ],
          threshold: 0.0270948391407728,
          right_val: -0.7895252108573914,
          left_val: 0.0143423900008202,
        },
        {
          features: [
            [0, 0, 15, 18, -1],
            [0, 9, 15, 9, 2],
          ],
          threshold: -0.3621011078357697,
          right_val: 0.0140213295817375,
          left_val: -0.6256042718887329,
        },
        {
          features: [
            [15, 11, 2, 2, -1],
            [15, 11, 1, 1, 2],
            [16, 12, 1, 1, 2],
          ],
          threshold: -0.0006687960121780634,
          right_val: -0.0524151995778084,
          left_val: 0.219661295413971,
        },
        {
          features: [
            [14, 12, 6, 3, -1],
            [17, 12, 3, 3, 2],
          ],
          threshold: -0.0373892411589623,
          right_val: 0.0257044993340969,
          left_val: -0.4731368124485016,
        },
        {
          features: [
            [8, 4, 3, 4, -1],
            [9, 4, 1, 4, 3],
          ],
          threshold: -0.00743860611692071,
          right_val: 0.0200388804078102,
          left_val: -0.5291485786437988,
        },
        {
          features: [
            [8, 6, 12, 4, -1],
            [12, 6, 4, 4, 3],
          ],
          threshold: 0.1044311970472336,
          right_val: 0.5159202814102173,
          left_val: -0.0229094605892897,
        },
        {
          features: [
            [9, 12, 2, 2, -1],
            [9, 13, 2, 1, 2],
          ],
          threshold: -0.000061161867051851,
          right_val: -0.1462540030479431,
          left_val: 0.077016606926918,
        },
        {
          features: [
            [6, 3, 1, 2, -1],
            [6, 4, 1, 1, 2],
          ],
          threshold: 0.0006583037902601063,
          right_val: -0.155699297785759,
          left_val: 0.0700152814388275,
        },
        {
          features: [
            [4, 7, 2, 8, -1],
            [4, 7, 1, 4, 2],
            [5, 11, 1, 4, 2],
          ],
          threshold: 0.009736723266541958,
          right_val: 0.3275456130504608,
          left_val: -0.0315822400152683,
        },
        {
          features: [
            [9, 17, 3, 2, -1],
            [10, 17, 1, 2, 3],
          ],
          threshold: -0.0029574360232800245,
          right_val: 0.0321847200393677,
          left_val: -0.3424771130084992,
        },
        {
          features: [
            [9, 6, 1, 3, -1],
            [9, 7, 1, 1, 3],
          ],
          threshold: 0.001631982042454183,
          right_val: 0.2265644073486328,
          left_val: -0.0494004786014557,
        },
        {
          features: [
            [6, 4, 1, 6, -1],
            [6, 7, 1, 3, 2],
          ],
          threshold: 0.0138449398800731,
          right_val: -0.5460066795349121,
          left_val: 0.0204766597598791,
        },
        {
          features: [
            [5, 6, 13, 6, -1],
            [5, 8, 13, 2, 3],
          ],
          threshold: 0.0315802991390228,
          right_val: 0.2909148037433624,
          left_val: -0.0424220487475395,
        },
        {
          features: [
            [6, 7, 4, 12, -1],
            [8, 7, 2, 12, 2],
          ],
          threshold: 0.008662402629852295,
          right_val: -0.2189218997955322,
          left_val: 0.0544328987598419,
        },
        {
          features: [
            [6, 12, 2, 4, -1],
            [7, 12, 1, 4, 2],
          ],
          threshold: -0.00046714721247553825,
          right_val: 0.0714919120073318,
          left_val: -0.1820573061704636,
        },
        {
          features: [
            [5, 14, 4, 3, -1],
            [5, 15, 4, 1, 3],
          ],
          threshold: 0.004183452110737562,
          right_val: 0.1728577017784119,
          left_val: -0.067491203546524,
        },
        {
          features: [
            [10, 5, 3, 1, -1],
            [11, 5, 1, 1, 3],
          ],
          threshold: -0.005333562847226858,
          right_val: 0.0138048296794295,
          left_val: -0.8468174934387207,
        },
        {
          features: [
            [4, 15, 4, 3, -1],
            [4, 16, 4, 1, 3],
          ],
          threshold: 0.007878279313445091,
          right_val: 0.2424273043870926,
          left_val: -0.0481667183339596,
        },
        {
          features: [
            [11, 12, 3, 2, -1],
            [12, 12, 1, 2, 3],
          ],
          threshold: 0.0038775329012423754,
          right_val: -0.4976325929164887,
          left_val: 0.0243111494928598,
        },
        {
          features: [
            [11, 10, 8, 2, -1],
            [15, 10, 4, 2, 2],
          ],
          threshold: -0.00016564880206715316,
          right_val: -0.1955423057079315,
          left_val: 0.0555463805794716,
        },
        {
          features: [
            [14, 18, 6, 2, -1],
            [17, 18, 3, 2, 2],
          ],
          threshold: 0.0189934000372887,
          right_val: 0.2847271859645844,
          left_val: -0.0364790894091129,
        },
        {
          features: [
            [7, 5, 3, 2, -1],
            [8, 5, 1, 2, 3],
          ],
          threshold: -0.003430875949561596,
          right_val: 0.036524198949337,
          left_val: -0.3281300067901611,
        },
        {
          features: [
            [11, 8, 2, 1, -1],
            [12, 8, 1, 1, 2],
          ],
          threshold: 0.000014614370229537599,
          right_val: 0.1062249019742012,
          left_val: -0.1010643988847733,
        },
        {
          features: [
            [12, 6, 3, 6, -1],
            [12, 8, 3, 2, 3],
          ],
          threshold: 0.0159789193421602,
          right_val: -0.3931018114089966,
          left_val: 0.0300593990832567,
        },
        {
          features: [
            [11, 9, 1, 2, -1],
            [11, 10, 1, 1, 2],
          ],
          threshold: -0.0002224571944680065,
          right_val: -0.0721516534686089,
          left_val: 0.1858648955821991,
        },
        {
          features: [
            [12, 9, 3, 9, -1],
            [13, 9, 1, 9, 3],
          ],
          threshold: 0.0206159092485905,
          right_val: -0.7839120030403137,
          left_val: 0.0152509901672602,
        },
        {
          features: [
            [0, 8, 1, 3, -1],
            [0, 9, 1, 1, 3],
          ],
          threshold: 0.0002864506095647812,
          right_val: -0.1530831009149551,
          left_val: 0.0687455981969833,
        },
        {
          features: [
            [0, 8, 1, 3, -1],
            [0, 9, 1, 1, 3],
          ],
          threshold: -0.000059233439969830215,
          right_val: 0.0984484925866127,
          left_val: -0.1254501938819885,
        },
        {
          features: [
            [3, 8, 2, 2, -1],
            [3, 8, 1, 1, 2],
            [4, 9, 1, 1, 2],
          ],
          threshold: -0.0007625786238349974,
          right_val: -0.0537602193653584,
          left_val: 0.215462401509285,
        },
        {
          features: [
            [4, 6, 2, 6, -1],
            [4, 9, 2, 3, 2],
          ],
          threshold: -0.001418163999915123,
          right_val: 0.0519821383059025,
          left_val: -0.1987688988447189,
        },
        {
          features: [
            [4, 9, 2, 9, -1],
            [4, 12, 2, 3, 3],
          ],
          threshold: -0.0447168685495853,
          right_val: 0.0129064498469234,
          left_val: -0.7550839781761169,
        },
        {
          features: [
            [7, 13, 2, 2, -1],
            [7, 13, 1, 1, 2],
            [8, 14, 1, 1, 2],
          ],
          threshold: -0.0013735699467360973,
          right_val: -0.0513946898281574,
          left_val: 0.2200313955545425,
        },
        {
          features: [
            [3, 6, 10, 6, -1],
            [3, 6, 5, 3, 2],
            [8, 9, 5, 3, 2],
          ],
          threshold: -0.0153527799993753,
          right_val: 0.0537811703979969,
          left_val: -0.2142284959554672,
        },
        {
          features: [
            [9, 9, 4, 6, -1],
            [11, 9, 2, 6, 2],
          ],
          threshold: 0.0138174397870898,
          right_val: 0.2939909100532532,
          left_val: -0.0351581200957298,
        },
        {
          features: [
            [2, 12, 14, 3, -1],
            [9, 12, 7, 3, 2],
          ],
          threshold: 0.0879816263914108,
          right_val: -0.7205359935760498,
          left_val: 0.0166887491941452,
        },
        {
          features: [
            [0, 0, 11, 18, -1],
            [0, 9, 11, 9, 2],
          ],
          threshold: 0.4048612117767334,
          right_val: -0.8272560834884644,
          left_val: 0.009469577111303806,
        },
        {
          features: [
            [4, 18, 4, 2, -1],
            [4, 18, 2, 1, 2],
            [6, 19, 2, 1, 2],
          ],
          threshold: 0.0019231239566579461,
          right_val: 0.1769602000713348,
          left_val: -0.0580163188278675,
        },
        {
          features: [
            [7, 13, 4, 6, -1],
            [7, 13, 2, 3, 2],
            [9, 16, 2, 3, 2],
          ],
          threshold: -0.0004075696924701333,
          right_val: -0.1263372004032135,
          left_val: 0.0876009464263916,
        },
        {
          features: [
            [8, 17, 3, 1, -1],
            [9, 17, 1, 1, 3],
          ],
          threshold: -0.0023862780071794987,
          right_val: 0.0271830298006535,
          left_val: -0.40085569024086,
        },
        {
          features: [
            [5, 14, 8, 6, -1],
            [5, 14, 4, 3, 2],
            [9, 17, 4, 3, 2],
          ],
          threshold: 0.0562350898981094,
          right_val: 0.7381873726844788,
          left_val: -0.0175413191318512,
        },
        {
          features: [
            [7, 12, 2, 3, -1],
            [7, 13, 2, 1, 3],
          ],
          threshold: 0.0004981040256097913,
          right_val: 0.1269799023866653,
          left_val: -0.0764870718121529,
        },
        {
          features: [
            [14, 4, 4, 2, -1],
            [14, 4, 2, 1, 2],
            [16, 5, 2, 1, 2],
          ],
          threshold: 0.0005328591796569526,
          right_val: -0.1760033965110779,
          left_val: 0.0595963001251221,
        },
        {
          features: [
            [7, 13, 2, 3, -1],
            [7, 14, 2, 1, 3],
          ],
          threshold: 0.0005994964740239084,
          right_val: 0.13002809882164,
          left_val: -0.0825090631842613,
        },
        {
          features: [
            [7, 14, 4, 2, -1],
            [7, 14, 2, 1, 2],
            [9, 15, 2, 1, 2],
          ],
          threshold: -0.0002072555071208626,
          right_val: -0.1172676980495453,
          left_val: 0.0933742225170136,
        },
        {
          features: [
            [10, 14, 2, 6, -1],
            [10, 16, 2, 2, 3],
          ],
          threshold: 0.0008131494978442788,
          right_val: 0.1470173001289368,
          left_val: -0.0800631269812584,
        },
        {
          features: [
            [9, 6, 9, 1, -1],
            [12, 6, 3, 1, 3],
          ],
          threshold: -0.0003497345023788512,
          right_val: -0.1088170036673546,
          left_val: 0.1105792969465256,
        },
        {
          features: [
            [2, 5, 18, 7, -1],
            [11, 5, 9, 7, 2],
          ],
          threshold: -0.2144889980554581,
          right_val: 0.0417115315794945,
          left_val: -0.3170115947723389,
        },
        {
          features: [
            [18, 6, 1, 2, -1],
            [18, 7, 1, 1, 2],
          ],
          threshold: 0.0005901074036955833,
          right_val: -0.2351225018501282,
          left_val: 0.0462803281843662,
        },
        {
          features: [
            [4, 14, 14, 6, -1],
            [4, 17, 14, 3, 2],
          ],
          threshold: -0.1209399998188019,
          right_val: 0.014982040040195,
          left_val: -0.6895709037780762,
        },
        {
          features: [
            [8, 0, 6, 20, -1],
            [10, 0, 2, 20, 3],
          ],
          threshold: 0.1018135026097298,
          right_val: -0.7119964957237244,
          left_val: 0.0112981395795941,
        },
        {
          features: [
            [12, 0, 8, 18, -1],
            [12, 9, 8, 9, 2],
          ],
          threshold: 0.352083295583725,
          right_val: -0.6757240891456604,
          left_val: 0.0129445102065802,
        },
        {
          features: [
            [12, 5, 2, 1, -1],
            [13, 5, 1, 1, 2],
          ],
          threshold: -0.000014602140254282858,
          right_val: -0.1428806036710739,
          left_val: 0.0695503130555153,
        },
        {
          features: [
            [0, 6, 6, 13, -1],
            [3, 6, 3, 13, 2],
          ],
          threshold: -0.2321286052465439,
          right_val: 0.0113943303003907,
          left_val: -0.7528740167617798,
        },
        {
          features: [
            [3, 15, 3, 4, -1],
            [4, 15, 1, 4, 3],
          ],
          threshold: -0.0014764709630981088,
          right_val: -0.0854709073901176,
          left_val: 0.1354779005050659,
        },
        {
          features: [
            [3, 13, 3, 6, -1],
            [4, 13, 1, 6, 3],
          ],
          threshold: 0.009932437911629677,
          right_val: 0.2458269000053406,
          left_val: -0.0487588010728359,
        },
        {
          features: [
            [3, 11, 9, 2, -1],
            [6, 11, 3, 2, 3],
          ],
          threshold: -0.0268572904169559,
          right_val: 0.0250822398811579,
          left_val: -0.4397571086883545,
        },
        {
          features: [
            [0, 11, 6, 8, -1],
            [3, 11, 3, 8, 2],
          ],
          threshold: -0.007361891213804483,
          right_val: -0.0972262099385262,
          left_val: 0.1238470003008843,
        },
        {
          features: [
            [16, 0, 3, 7, -1],
            [17, 0, 1, 7, 3],
          ],
          threshold: -0.0197857301682234,
          right_val: 0.0234819799661636,
          left_val: -0.5093231797218323,
        },
        {
          features: [
            [16, 1, 2, 6, -1],
            [16, 1, 1, 3, 2],
            [17, 4, 1, 3, 2],
          ],
          threshold: -0.000014635100342275109,
          right_val: -0.1214566975831986,
          left_val: 0.094043917953968,
        },
        {
          features: [
            [3, 7, 6, 10, -1],
            [3, 7, 3, 5, 2],
            [6, 12, 3, 5, 2],
          ],
          threshold: -0.0540670305490494,
          right_val: 0.0195001401007175,
          left_val: -0.545862078666687,
        },
        {
          features: [
            [2, 0, 6, 7, -1],
            [5, 0, 3, 7, 2],
          ],
          threshold: 0.0115321697667241,
          right_val: 0.1376397013664246,
          left_val: -0.0764091536402702,
        },
        {
          features: [
            [1, 2, 12, 2, -1],
            [5, 2, 4, 2, 3],
          ],
          threshold: -0.004435854032635689,
          right_val: -0.0917192995548248,
          left_val: 0.1235975995659828,
        },
        {
          features: [
            [6, 4, 1, 2, -1],
            [6, 5, 1, 1, 2],
          ],
          threshold: 0.0008321601781062782,
          right_val: -0.2044076025485992,
          left_val: 0.0636590719223022,
        },
        {
          features: [
            [0, 14, 8, 6, -1],
            [4, 14, 4, 6, 2],
          ],
          threshold: -0.1250396966934204,
          right_val: 0.027199100703001,
          left_val: -0.4152475893497467,
        },
        {
          features: [
            [3, 11, 9, 3, -1],
            [6, 11, 3, 3, 3],
          ],
          threshold: 0.0496183186769485,
          right_val: -0.6166685223579407,
          left_val: 0.0159551091492176,
        },
        {
          features: [
            [4, 14, 2, 2, -1],
            [4, 14, 1, 1, 2],
            [5, 15, 1, 1, 2],
          ],
          threshold: -0.0030613599810749292,
          right_val: -0.0334494486451149,
          left_val: 0.3666220903396606,
        },
        {
          features: [
            [11, 2, 3, 2, -1],
            [12, 2, 1, 2, 3],
          ],
          threshold: 0.0035273379180580378,
          right_val: -0.3847880959510803,
          left_val: 0.0317579805850983,
        },
        {
          features: [
            [18, 5, 2, 6, -1],
            [18, 5, 1, 3, 2],
            [19, 8, 1, 3, 2],
          ],
          threshold: -0.00667265709489584,
          right_val: -0.0344086810946465,
          left_val: 0.3209584057331085,
        },
        {
          features: [
            [0, 5, 1, 2, -1],
            [0, 6, 1, 1, 2],
          ],
          threshold: -0.002579550025984645,
          right_val: 0.0285621304064989,
          left_val: -0.3787052929401398,
        },
        {
          features: [
            [8, 4, 6, 1, -1],
            [11, 4, 3, 1, 2],
          ],
          threshold: 0.007841778919100761,
          right_val: 0.5170410871505737,
          left_val: -0.0204797703772783,
        },
        {
          features: [
            [4, 5, 2, 3, -1],
            [5, 5, 1, 3, 2],
          ],
          threshold: 0.000311013194732368,
          right_val: 0.0972045212984085,
          left_val: -0.1080913990736008,
        },
        {
          features: [
            [1, 3, 6, 4, -1],
            [3, 3, 2, 4, 3],
          ],
          threshold: 0.0026113479398190975,
          right_val: 0.1469120979309082,
          left_val: -0.0817704275250435,
        },
        {
          features: [
            [12, 5, 6, 1, -1],
            [14, 5, 2, 1, 3],
          ],
          threshold: 0.007347226142883301,
          right_val: -0.4302506148815155,
          left_val: 0.0251312591135502,
        },
        {
          features: [
            [6, 9, 3, 3, -1],
            [6, 10, 3, 1, 3],
          ],
          threshold: 0.00013528259296435863,
          right_val: 0.0675846785306931,
          left_val: -0.1475106030702591,
        },
        {
          features: [
            [4, 3, 2, 2, -1],
            [4, 4, 2, 1, 2],
          ],
          threshold: -0.00005102689829072915,
          right_val: 0.0843330472707748,
          left_val: -0.1216135993599892,
        },
        {
          features: [
            [8, 7, 3, 3, -1],
            [8, 8, 3, 1, 3],
          ],
          threshold: 0.0011552199721336365,
          right_val: 0.1977366060018539,
          left_val: -0.0546638295054436,
        },
        {
          features: [
            [5, 5, 10, 14, -1],
            [5, 5, 5, 7, 2],
            [10, 12, 5, 7, 2],
          ],
          threshold: -0.082931712269783,
          right_val: 0.0205823592841625,
          left_val: -0.5192332863807678,
        },
        {
          features: [
            [16, 5, 2, 6, -1],
            [16, 7, 2, 2, 3],
          ],
          threshold: -0.00046260739327408373,
          right_val: -0.1172529980540276,
          left_val: 0.0855882689356804,
        },
        {
          features: [
            [19, 5, 1, 3, -1],
            [19, 6, 1, 1, 3],
          ],
          threshold: 0.0006790637271478772,
          right_val: -0.2262842059135437,
          left_val: 0.0459801182150841,
        },
        {
          features: [
            [3, 6, 2, 2, -1],
            [3, 6, 1, 1, 2],
            [4, 7, 1, 1, 2],
          ],
          threshold: 0.0014090019976720214,
          right_val: 0.227227196097374,
          left_val: -0.0476289205253124,
        },
        {
          features: [
            [0, 1, 10, 10, -1],
            [5, 1, 5, 10, 2],
          ],
          threshold: 0.2895491123199463,
          right_val: -0.639670193195343,
          left_val: 0.0167012400925159,
        },
        {
          features: [
            [3, 0, 8, 1, -1],
            [7, 0, 4, 1, 2],
          ],
          threshold: 0.0193761307746172,
          right_val: 0.5059049725532532,
          left_val: -0.0225694105029106,
        },
        {
          features: [
            [14, 5, 6, 1, -1],
            [16, 5, 2, 1, 3],
          ],
          threshold: 0.00042641081381589174,
          right_val: -0.1666630059480667,
          left_val: 0.0660417228937149,
        },
        {
          features: [
            [6, 16, 1, 3, -1],
            [6, 17, 1, 1, 3],
          ],
          threshold: 0.0017502580303698778,
          right_val: 0.1951259970664978,
          left_val: -0.058077909052372,
        },
        {
          features: [
            [6, 14, 2, 4, -1],
            [6, 14, 1, 2, 2],
            [7, 16, 1, 2, 2],
          ],
          threshold: -0.0032605750020593405,
          right_val: 0.0383287183940411,
          left_val: -0.2910188138484955,
        },
        {
          features: [
            [0, 7, 2, 5, -1],
            [1, 7, 1, 5, 2],
          ],
          threshold: 0.001951904036104679,
          right_val: -0.1691060066223145,
          left_val: 0.059565968811512,
        },
        {
          features: [
            [18, 0, 2, 8, -1],
            [18, 0, 1, 4, 2],
            [19, 4, 1, 4, 2],
          ],
          threshold: -0.00320539902895689,
          right_val: -0.0560532584786415,
          left_val: 0.1992776989936829,
        },
        {
          features: [
            [5, 8, 6, 2, -1],
            [8, 8, 3, 2, 2],
          ],
          threshold: 0.0017617279663681984,
          right_val: -0.2127664983272553,
          left_val: 0.0506975315511227,
        },
        {
          features: [
            [4, 8, 8, 3, -1],
            [8, 8, 4, 3, 2],
          ],
          threshold: -0.006004310213029385,
          right_val: 0.082275278866291,
          left_val: -0.1369926929473877,
        },
        {
          features: [
            [8, 0, 2, 2, -1],
            [8, 1, 2, 1, 2],
          ],
          threshold: 0.0024830829352140427,
          right_val: 0.2168422043323517,
          left_val: -0.0515616610646248,
        },
        {
          features: [
            [13, 8, 6, 11, -1],
            [15, 8, 2, 11, 3],
          ],
          threshold: -0.1082193031907082,
          right_val: 0.0144336502999067,
          left_val: -0.7837529182434082,
        },
        {
          features: [
            [11, 15, 9, 5, -1],
            [14, 15, 3, 5, 3],
          ],
          threshold: -0.0075229378417134285,
          right_val: -0.0905826985836029,
          left_val: 0.1345372945070267,
        },
        {
          features: [
            [5, 4, 12, 15, -1],
            [9, 4, 4, 15, 3],
          ],
          threshold: 0.0307509899139404,
          right_val: -0.0994755998253822,
          left_val: 0.1108169034123421,
        },
        {
          features: [
            [16, 12, 2, 8, -1],
            [16, 12, 1, 4, 2],
            [17, 16, 1, 4, 2],
          ],
          threshold: -0.0028948320541530848,
          right_val: -0.0526392608880997,
          left_val: 0.1900573968887329,
        },
        {
          features: [
            [7, 13, 10, 6, -1],
            [7, 16, 10, 3, 2],
          ],
          threshold: 0.0027011099737137556,
          right_val: -0.1985194981098175,
          left_val: 0.0585735589265823,
        },
        {
          features: [
            [6, 15, 3, 4, -1],
            [6, 17, 3, 2, 2],
          ],
          threshold: 0.0012562989722937346,
          right_val: 0.1543684005737305,
          left_val: -0.073565311729908,
        },
      ],
      threshold: -1.394389033317566,
    },
    {
      simpleClassifiers: [
        {
          features: [
            [9, 5, 8, 2, -1],
            [13, 5, 4, 2, 2],
          ],
          threshold: -0.0214605797082186,
          right_val: -0.2089038044214249,
          left_val: 0.3250505030155182,
        },
        {
          features: [
            [5, 6, 3, 4, -1],
            [6, 6, 1, 4, 3],
          ],
          threshold: 0.007678543217480183,
          right_val: 0.3052583932876587,
          left_val: -0.1323131024837494,
        },
        {
          features: [
            [10, 8, 7, 6, -1],
            [10, 10, 7, 2, 3],
          ],
          threshold: 0.0034118059556931257,
          right_val: 0.1101097986102104,
          left_val: -0.3079307973384857,
        },
        {
          features: [
            [12, 13, 1, 4, -1],
            [12, 15, 1, 2, 2],
          ],
          threshold: -0.00001471049017709447,
          right_val: -0.2964186072349548,
          left_val: 0.0958588570356369,
        },
        {
          features: [
            [2, 10, 3, 4, -1],
            [3, 10, 1, 4, 3],
          ],
          threshold: 0.0105380499735475,
          right_val: 0.3723484873771668,
          left_val: -0.0792525410652161,
        },
        {
          features: [
            [8, 7, 6, 6, -1],
            [8, 7, 3, 3, 2],
            [11, 10, 3, 3, 2],
          ],
          threshold: -0.00025260078837163746,
          right_val: -0.3078433871269226,
          left_val: 0.0671211108565331,
        },
        {
          features: [
            [2, 0, 15, 2, -1],
            [7, 0, 5, 2, 3],
          ],
          threshold: -0.00356658105738461,
          right_val: -0.1708378940820694,
          left_val: 0.14667609333992,
        },
        {
          features: [
            [13, 10, 1, 3, -1],
            [13, 11, 1, 1, 3],
          ],
          threshold: -0.001267735962755978,
          right_val: 0.0203741192817688,
          left_val: -0.4906372129917145,
        },
        {
          features: [
            [2, 9, 3, 4, -1],
            [3, 9, 1, 4, 3],
          ],
          threshold: -0.006766938138753176,
          right_val: -0.0741759017109871,
          left_val: 0.2576732933521271,
        },
        {
          features: [
            [6, 4, 3, 2, -1],
            [6, 5, 3, 1, 2],
          ],
          threshold: -0.0006044725887477398,
          right_val: 0.0913498476147652,
          left_val: -0.1919641047716141,
        },
        {
          features: [
            [10, 16, 2, 3, -1],
            [11, 16, 1, 3, 2],
          ],
          threshold: -0.0025375590194016695,
          right_val: 0.0515472516417503,
          left_val: -0.3566387891769409,
        },
        {
          features: [
            [7, 13, 2, 3, -1],
            [7, 14, 2, 1, 3],
          ],
          threshold: -0.007020055782049894,
          right_val: -0.0439679883420467,
          left_val: 0.3971908092498779,
        },
        {
          features: [
            [6, 12, 2, 4, -1],
            [6, 12, 1, 2, 2],
            [7, 14, 1, 2, 2],
          ],
          threshold: -0.005704937968403101,
          right_val: 0.0298259295523167,
          left_val: -0.5001549124717712,
        },
        {
          features: [
            [9, 1, 6, 1, -1],
            [12, 1, 3, 1, 2],
          ],
          threshold: 0.0014744909713044763,
          right_val: -0.2613981068134308,
          left_val: 0.0585462115705013,
        },
        {
          features: [
            [6, 6, 3, 4, -1],
            [7, 6, 1, 4, 3],
          ],
          threshold: 0.009283481165766716,
          right_val: 0.3344317078590393,
          left_val: -0.0428367592394352,
        },
        {
          features: [
            [9, 8, 3, 3, -1],
            [9, 9, 3, 1, 3],
          ],
          threshold: 0.0009966015350073576,
          right_val: 0.1619178056716919,
          left_val: -0.1042511016130447,
        },
        {
          features: [
            [8, 7, 12, 3, -1],
            [14, 7, 6, 3, 2],
          ],
          threshold: -0.0759327337145805,
          right_val: 0.0430756881833076,
          left_val: -0.3735632002353668,
        },
        {
          features: [
            [12, 10, 4, 2, -1],
            [12, 10, 2, 1, 2],
            [14, 11, 2, 1, 2],
          ],
          threshold: 0.00005537071047001518,
          right_val: 0.1156015023589134,
          left_val: -0.1457054018974304,
        },
        {
          features: [
            [16, 11, 1, 2, -1],
            [16, 12, 1, 1, 2],
          ],
          threshold: 0.000014746849956281949,
          right_val: 0.1174774020910263,
          left_val: -0.1297267973423004,
        },
        {
          features: [
            [6, 2, 1, 2, -1],
            [6, 3, 1, 1, 2],
          ],
          threshold: -0.0001487591944169253,
          right_val: 0.0787826925516129,
          left_val: -0.1800293028354645,
        },
        {
          features: [
            [5, 10, 2, 3, -1],
            [5, 11, 2, 1, 3],
          ],
          threshold: 0.003375146072357893,
          right_val: 0.1859685927629471,
          left_val: -0.0772420093417168,
        },
        {
          features: [
            [5, 9, 2, 3, -1],
            [5, 10, 2, 1, 3],
          ],
          threshold: 0.0003427125921007246,
          right_val: 0.1047258004546166,
          left_val: -0.1539334058761597,
        },
        {
          features: [
            [0, 0, 2, 1, -1],
            [1, 0, 1, 1, 2],
          ],
          threshold: -0.00045711229904554784,
          right_val: 0.0618186704814434,
          left_val: -0.2230052947998047,
        },
        {
          features: [
            [0, 0, 2, 1, -1],
            [1, 0, 1, 1, 2],
          ],
          threshold: 0.00032788628595881164,
          right_val: -0.1888982951641083,
          left_val: 0.0794487074017525,
        },
        {
          features: [
            [12, 0, 8, 2, -1],
            [12, 0, 4, 1, 2],
            [16, 1, 4, 1, 2],
          ],
          threshold: -0.0009675401961430907,
          right_val: -0.1080107018351555,
          left_val: 0.1313713043928146,
        },
        {
          features: [
            [10, 11, 3, 8, -1],
            [11, 11, 1, 8, 3],
          ],
          threshold: 0.0105370096862316,
          right_val: -0.574797511100769,
          left_val: 0.0221382696181536,
        },
        {
          features: [
            [5, 11, 3, 3, -1],
            [5, 12, 3, 1, 3],
          ],
          threshold: 0.005679640918970108,
          right_val: 0.2484958022832871,
          left_val: -0.056034579873085,
        },
        {
          features: [
            [5, 10, 1, 6, -1],
            [5, 13, 1, 3, 2],
          ],
          threshold: -0.008808396756649017,
          right_val: 0.0427269488573074,
          left_val: -0.3716768026351929,
        },
        {
          features: [
            [6, 2, 6, 6, -1],
            [6, 2, 3, 3, 2],
            [9, 5, 3, 3, 2],
          ],
          threshold: -0.0283197108656168,
          right_val: 0.0208440497517586,
          left_val: -0.6238784790039062,
        },
        {
          features: [
            [11, 4, 1, 6, -1],
            [11, 6, 1, 2, 3],
          ],
          threshold: 0.0136378603056073,
          right_val: -0.7153713703155518,
          left_val: 0.0144342398270965,
        },
        {
          features: [
            [18, 3, 2, 16, -1],
            [18, 3, 1, 8, 2],
            [19, 11, 1, 8, 2],
          ],
          threshold: 0.0118227703496814,
          right_val: 0.3068254888057709,
          left_val: -0.0431810915470123,
        },
        {
          features: [
            [10, 12, 3, 2, -1],
            [11, 12, 1, 2, 3],
          ],
          threshold: -0.000610356975812465,
          right_val: 0.0621156208217144,
          left_val: -0.2041833996772766,
        },
        {
          features: [
            [7, 14, 2, 3, -1],
            [7, 15, 2, 1, 3],
          ],
          threshold: -0.0056125568225979805,
          right_val: -0.0354489609599113,
          left_val: 0.3648501038551331,
        },
        {
          features: [
            [16, 12, 2, 1, -1],
            [17, 12, 1, 1, 2],
          ],
          threshold: 0.000014603640011046082,
          right_val: 0.1214229017496109,
          left_val: -0.0960969105362892,
        },
        {
          features: [
            [15, 6, 4, 2, -1],
            [15, 7, 4, 1, 2],
          ],
          threshold: 0.001906123012304306,
          right_val: -0.2297890931367874,
          left_val: 0.0531358681619167,
        },
        {
          features: [
            [4, 6, 2, 3, -1],
            [4, 7, 2, 1, 3],
          ],
          threshold: -0.003664422081783414,
          right_val: -0.0685569122433662,
          left_val: 0.1961452960968018,
        },
        {
          features: [
            [8, 19, 6, 1, -1],
            [11, 19, 3, 1, 2],
          ],
          threshold: 0.0012336249928921461,
          right_val: 0.1392022967338562,
          left_val: -0.087000347673893,
        },
        {
          features: [
            [9, 12, 3, 3, -1],
            [9, 13, 3, 1, 3],
          ],
          threshold: 0.005466056987643242,
          right_val: -0.4832952916622162,
          left_val: 0.0226608905941248,
        },
        {
          features: [
            [10, 12, 1, 3, -1],
            [10, 13, 1, 1, 3],
          ],
          threshold: -0.0006173094734549522,
          right_val: 0.0552585199475288,
          left_val: -0.2195954024791718,
        },
        {
          features: [
            [8, 6, 2, 3, -1],
            [8, 7, 2, 1, 3],
          ],
          threshold: 0.002960470039397478,
          right_val: 0.2747671008110046,
          left_val: -0.0505482293665409,
        },
        {
          features: [
            [5, 7, 6, 5, -1],
            [8, 7, 3, 5, 2],
          ],
          threshold: 0.0280150007456541,
          right_val: -0.6049836874008179,
          left_val: 0.0188746508210897,
        },
        {
          features: [
            [14, 10, 1, 2, -1],
            [14, 11, 1, 1, 2],
          ],
          threshold: -0.000007165198894654168,
          right_val: -0.1060696989297867,
          left_val: 0.1083621978759766,
        },
        {
          features: [
            [11, 7, 6, 3, -1],
            [13, 7, 2, 3, 3],
          ],
          threshold: -0.0163671504706144,
          right_val: -0.0371376909315586,
          left_val: 0.2864503860473633,
        },
        {
          features: [
            [14, 6, 6, 1, -1],
            [16, 6, 2, 1, 3],
          ],
          threshold: 0.001028071972541511,
          right_val: -0.2179502993822098,
          left_val: 0.0563181415200233,
        },
        {
          features: [
            [9, 7, 1, 3, -1],
            [9, 8, 1, 1, 3],
          ],
          threshold: 0.0013662660494446754,
          right_val: 0.2380400002002716,
          left_val: -0.0468035005033016,
        },
        {
          features: [
            [9, 5, 2, 8, -1],
            [9, 5, 1, 4, 2],
            [10, 9, 1, 4, 2],
          ],
          threshold: 0.007662673946470022,
          right_val: -0.5684748888015747,
          left_val: 0.0215952601283789,
        },
        {
          features: [
            [6, 12, 1, 4, -1],
            [6, 14, 1, 2, 2],
          ],
          threshold: -0.004511752165853977,
          right_val: 0.0304854903370142,
          left_val: -0.3579497933387756,
        },
        {
          features: [
            [5, 13, 4, 2, -1],
            [5, 14, 4, 1, 2],
          ],
          threshold: -0.004377396777272224,
          right_val: -0.0539998188614845,
          left_val: 0.2319266051054001,
        },
        {
          features: [
            [12, 9, 2, 4, -1],
            [12, 11, 2, 2, 2],
          ],
          threshold: -0.007247462868690491,
          right_val: 0.026374189183116,
          left_val: -0.43440380692482,
        },
        {
          features: [
            [12, 7, 3, 6, -1],
            [13, 7, 1, 6, 3],
          ],
          threshold: 0.000791462603956461,
          right_val: 0.110885001718998,
          left_val: -0.0999245867133141,
        },
        {
          features: [
            [5, 0, 2, 14, -1],
            [5, 7, 2, 7, 2],
          ],
          threshold: 0.0641668066382408,
          right_val: -0.5784941911697388,
          left_val: 0.0189386699348688,
        },
        {
          features: [
            [9, 3, 1, 2, -1],
            [9, 4, 1, 1, 2],
          ],
          threshold: -0.00011797840124927461,
          right_val: 0.0687772035598755,
          left_val: -0.1488956958055496,
        },
        {
          features: [
            [6, 1, 14, 12, -1],
            [6, 5, 14, 4, 3],
          ],
          threshold: 0.0128012895584106,
          right_val: -0.2086596935987473,
          left_val: 0.0561793297529221,
        },
        {
          features: [
            [13, 6, 7, 6, -1],
            [13, 9, 7, 3, 2],
          ],
          threshold: -0.027018740773201,
          right_val: -0.0250545796006918,
          left_val: 0.4535689055919647,
        },
        {
          features: [
            [14, 9, 3, 3, -1],
            [14, 10, 3, 1, 3],
          ],
          threshold: -0.00694317277520895,
          right_val: 0.0218001399189234,
          left_val: -0.529165506362915,
        },
        {
          features: [
            [17, 12, 3, 1, -1],
            [18, 12, 1, 1, 3],
          ],
          threshold: 0.0033396780490875244,
          right_val: 0.3119843900203705,
          left_val: -0.0372959598898888,
        },
        {
          features: [
            [8, 2, 3, 2, -1],
            [9, 2, 1, 2, 3],
          ],
          threshold: -0.00038888349081389606,
          right_val: 0.0709818303585052,
          left_val: -0.1563013046979904,
        },
        {
          features: [
            [7, 11, 2, 1, -1],
            [8, 11, 1, 1, 2],
          ],
          threshold: -0.0007140067755244672,
          right_val: -0.0540692806243896,
          left_val: 0.2179943025112152,
        },
        {
          features: [
            [5, 7, 3, 2, -1],
            [5, 8, 3, 1, 2],
          ],
          threshold: 0.0125496303662658,
          right_val: -0.7832044959068298,
          left_val: 0.0173571798950434,
        },
        {
          features: [
            [11, 11, 2, 1, -1],
            [12, 11, 1, 1, 2],
          ],
          threshold: -0.000014623020433646161,
          right_val: -0.1421297043561935,
          left_val: 0.0786401033401489,
        },
        {
          features: [
            [11, 11, 3, 1, -1],
            [12, 11, 1, 1, 3],
          ],
          threshold: -0.0012133170384913683,
          right_val: 0.0342876389622688,
          left_val: -0.3137122988700867,
        },
        {
          features: [
            [9, 5, 1, 3, -1],
            [9, 6, 1, 1, 3],
          ],
          threshold: 0.003688272088766098,
          right_val: 0.3012467920780182,
          left_val: -0.0383823812007904,
        },
        {
          features: [
            [12, 9, 1, 2, -1],
            [12, 10, 1, 1, 2],
          ],
          threshold: -0.000014818239833402913,
          right_val: -0.0917033776640892,
          left_val: 0.1256116926670075,
        },
        {
          features: [
            [12, 7, 2, 3, -1],
            [13, 7, 1, 3, 2],
          ],
          threshold: 0.00303021096624434,
          right_val: 0.3788954019546509,
          left_val: -0.0295430701225996,
        },
        {
          features: [
            [5, 11, 6, 3, -1],
            [8, 11, 3, 3, 2],
          ],
          threshold: 0.0000593408512941096,
          right_val: 0.0701024308800697,
          left_val: -0.1774571985006332,
        },
        {
          features: [
            [6, 10, 2, 2, -1],
            [6, 10, 1, 1, 2],
            [7, 11, 1, 1, 2],
          ],
          threshold: -0.000029449560315697454,
          right_val: -0.1112897992134094,
          left_val: 0.1205231994390488,
        },
        {
          features: [
            [17, 2, 1, 9, -1],
            [17, 5, 1, 3, 3],
          ],
          threshold: -0.0177711397409439,
          right_val: 0.0256007891148329,
          left_val: -0.4710831046104431,
        },
        {
          features: [
            [4, 7, 2, 6, -1],
            [4, 7, 1, 3, 2],
            [5, 10, 1, 3, 2],
          ],
          threshold: 0.007677535992115736,
          right_val: 0.2702176868915558,
          left_val: -0.04075787961483,
        },
        {
          features: [
            [0, 1, 11, 18, -1],
            [0, 10, 11, 9, 2],
          ],
          threshold: -0.1851301938295364,
          right_val: 0.0387909114360809,
          left_val: -0.3023875057697296,
        },
        {
          features: [
            [7, 6, 2, 8, -1],
            [7, 10, 2, 4, 2],
          ],
          threshold: 0.0276971906423569,
          right_val: -0.4416660070419312,
          left_val: 0.0267128106206656,
        },
        {
          features: [
            [6, 2, 4, 6, -1],
            [6, 5, 4, 3, 2],
          ],
          threshold: -0.0204276498407125,
          right_val: -0.0556727014482021,
          left_val: 0.2508660852909088,
        },
        {
          features: [
            [2, 12, 12, 4, -1],
            [2, 14, 12, 2, 2],
          ],
          threshold: 0.009020037017762661,
          right_val: -0.2744598090648651,
          left_val: 0.0473440699279308,
        },
        {
          features: [
            [9, 0, 6, 1, -1],
            [12, 0, 3, 1, 2],
          ],
          threshold: -0.0012504979968070984,
          right_val: 0.0796676501631737,
          left_val: -0.1497119069099426,
        },
        {
          features: [
            [5, 0, 12, 2, -1],
            [5, 1, 12, 1, 2],
          ],
          threshold: -0.0100211603567004,
          right_val: -0.0492179095745087,
          left_val: 0.2424885928630829,
        },
        {
          features: [
            [10, 0, 2, 1, -1],
            [11, 0, 1, 1, 2],
          ],
          threshold: 0.0002604232868179679,
          right_val: -0.1854428052902222,
          left_val: 0.0631924271583557,
        },
        {
          features: [
            [7, 14, 3, 3, -1],
            [7, 15, 3, 1, 3],
          ],
          threshold: 0.001192054944112897,
          right_val: 0.1355233937501907,
          left_val: -0.0865479111671448,
        },
        {
          features: [
            [4, 13, 5, 3, -1],
            [4, 14, 5, 1, 3],
          ],
          threshold: 0.0030391330365091562,
          right_val: 0.1647980064153671,
          left_val: -0.07296521961689,
        },
        {
          features: [
            [9, 16, 6, 2, -1],
            [9, 17, 6, 1, 2],
          ],
          threshold: -0.000029615699531859718,
          right_val: -0.1450296938419342,
          left_val: 0.0820479765534401,
        },
        {
          features: [
            [11, 16, 5, 3, -1],
            [11, 17, 5, 1, 3],
          ],
          threshold: -0.0122263403609395,
          right_val: 0.0204057991504669,
          left_val: -0.5301417708396912,
        },
        {
          features: [
            [5, 0, 3, 15, -1],
            [6, 0, 1, 15, 3],
          ],
          threshold: -0.0281248893588781,
          right_val: 0.0176881197839975,
          left_val: -0.5514876246452332,
        },
        {
          features: [
            [9, 16, 8, 4, -1],
            [9, 18, 8, 2, 2],
          ],
          threshold: -0.0483071096241474,
          right_val: 0.0110205402597785,
          left_val: -0.8257979154586792,
        },
        {
          features: [
            [0, 6, 3, 2, -1],
            [0, 7, 3, 1, 2],
          ],
          threshold: 0.00461841095238924,
          right_val: -0.301153689622879,
          left_val: 0.0320699699223042,
        },
        {
          features: [
            [5, 9, 3, 1, -1],
            [6, 9, 1, 1, 3],
          ],
          threshold: -0.0008427574066445231,
          right_val: -0.0630094334483147,
          left_val: 0.1703443974256516,
        },
        {
          features: [
            [9, 11, 4, 2, -1],
            [9, 11, 2, 1, 2],
            [11, 12, 2, 1, 2],
          ],
          threshold: 0.006386328022927046,
          right_val: -0.7134649157524109,
          left_val: 0.0163072999566793,
        },
        {
          features: [
            [4, 13, 2, 2, -1],
            [4, 13, 1, 1, 2],
            [5, 14, 1, 1, 2],
          ],
          threshold: -0.0007720306748524308,
          right_val: -0.0661927834153175,
          left_val: 0.1671528071165085,
        },
        {
          features: [
            [6, 4, 1, 2, -1],
            [6, 5, 1, 1, 2],
          ],
          threshold: -0.0022645338904112577,
          right_val: 0.0281686708331108,
          left_val: -0.351070910692215,
        },
        {
          features: [
            [14, 18, 2, 2, -1],
            [14, 18, 1, 1, 2],
            [15, 19, 1, 1, 2],
          ],
          threshold: -0.003773879026994109,
          right_val: -0.0202226098626852,
          left_val: 0.5276281833648682,
        },
        {
          features: [
            [7, 10, 5, 6, -1],
            [7, 12, 5, 2, 3],
          ],
          threshold: 0.00582041684538126,
          right_val: -0.1467539072036743,
          left_val: 0.0708640664815903,
        },
        {
          features: [
            [8, 7, 4, 6, -1],
            [8, 9, 4, 2, 3],
          ],
          threshold: -0.0120692504569888,
          right_val: -0.0443129688501358,
          left_val: 0.2392809987068176,
        },
        {
          features: [
            [7, 9, 6, 2, -1],
            [9, 9, 2, 2, 3],
          ],
          threshold: 0.0033203759230673313,
          right_val: 0.2027768045663834,
          left_val: -0.0657495334744453,
        },
        {
          features: [
            [6, 6, 6, 4, -1],
            [6, 6, 3, 2, 2],
            [9, 8, 3, 2, 2],
          ],
          threshold: 0.0021621929481625557,
          right_val: -0.1812534928321838,
          left_val: 0.0674079805612564,
        },
        {
          features: [
            [10, 3, 1, 6, -1],
            [10, 5, 1, 2, 3],
          ],
          threshold: 0.0122291501611471,
          right_val: -0.4918099939823151,
          left_val: 0.0225593093782663,
        },
        {
          features: [
            [5, 2, 12, 14, -1],
            [5, 2, 6, 7, 2],
            [11, 9, 6, 7, 2],
          ],
          threshold: -0.006725350860506296,
          right_val: 0.0697866529226303,
          left_val: -0.1529005020856857,
        },
        {
          features: [
            [13, 5, 6, 2, -1],
            [13, 6, 6, 1, 2],
          ],
          threshold: 0.0023579499684274197,
          right_val: -0.2083828002214432,
          left_val: 0.0492121018469334,
        },
        {
          features: [
            [16, 0, 4, 8, -1],
            [16, 0, 2, 4, 2],
            [18, 4, 2, 4, 2],
          ],
          threshold: -0.002295068930834532,
          right_val: -0.096624918282032,
          left_val: 0.1240044012665749,
        },
        {
          features: [
            [3, 12, 3, 1, -1],
            [4, 12, 1, 1, 3],
          ],
          threshold: 0.0010958530474454165,
          right_val: 0.1520861983299255,
          left_val: -0.0732707530260086,
        },
        {
          features: [
            [3, 10, 3, 4, -1],
            [4, 10, 1, 4, 3],
          ],
          threshold: -0.0013427219819277525,
          right_val: -0.0956898778676987,
          left_val: 0.1223303973674774,
        },
        {
          features: [
            [4, 6, 1, 6, -1],
            [4, 9, 1, 3, 2],
          ],
          threshold: 0.0005469141760841012,
          right_val: 0.0843817368149757,
          left_val: -0.1392416059970856,
        },
        {
          features: [
            [3, 7, 15, 1, -1],
            [8, 7, 5, 1, 3],
          ],
          threshold: 0.008459881879389286,
          right_val: -0.1331889927387238,
          left_val: 0.0896898731589317,
        },
        {
          features: [
            [1, 15, 6, 5, -1],
            [4, 15, 3, 5, 2],
          ],
          threshold: -0.0915971174836159,
          right_val: 0.0228678695857525,
          left_val: -0.6185473203659058,
        },
        {
          features: [
            [11, 9, 8, 4, -1],
            [15, 9, 4, 4, 2],
          ],
          threshold: -0.0011090439511463046,
          right_val: -0.1880645006895065,
          left_val: 0.0585137493908405,
        },
        {
          features: [
            [15, 7, 2, 4, -1],
            [16, 7, 1, 4, 2],
          ],
          threshold: 0.000022256910597207025,
          right_val: 0.1278091073036194,
          left_val: -0.0844882801175117,
        },
        {
          features: [
            [19, 1, 1, 2, -1],
            [19, 2, 1, 1, 2],
          ],
          threshold: -0.00015437819820363075,
          right_val: 0.0860469788312912,
          left_val: -0.1222802996635437,
        },
        {
          features: [
            [6, 15, 3, 3, -1],
            [7, 15, 1, 3, 3],
          ],
          threshold: -0.0026862788945436478,
          right_val: 0.0442559607326984,
          left_val: -0.2448700070381165,
        },
        {
          features: [
            [3, 16, 3, 1, -1],
            [4, 16, 1, 1, 3],
          ],
          threshold: -0.004047864116728306,
          right_val: -0.0422008708119392,
          left_val: 0.2703068852424622,
        },
        {
          features: [
            [3, 10, 3, 10, -1],
            [4, 10, 1, 10, 3],
          ],
          threshold: -0.0533402413129807,
          right_val: 0.0143880397081375,
          left_val: -0.7623234987258911,
        },
        {
          features: [
            [18, 17, 2, 2, -1],
            [18, 17, 1, 1, 2],
            [19, 18, 1, 1, 2],
          ],
          threshold: 0.0028256059158593416,
          right_val: 0.3969297111034393,
          left_val: -0.029877070337534,
        },
        {
          features: [
            [3, 12, 6, 4, -1],
            [3, 12, 3, 2, 2],
            [6, 14, 3, 2, 2],
          ],
          threshold: 0.0144437300041318,
          right_val: -0.3660664856433868,
          left_val: 0.0301867108792067,
        },
        {
          features: [
            [5, 17, 2, 2, -1],
            [5, 17, 1, 1, 2],
            [6, 18, 1, 1, 2],
          ],
          threshold: 0.0013111650478094816,
          right_val: 0.2243445962667465,
          left_val: -0.0481403693556786,
        },
        {
          features: [
            [7, 16, 2, 3, -1],
            [7, 17, 2, 1, 3],
          ],
          threshold: 0.001673068036325276,
          right_val: 0.1639419049024582,
          left_val: -0.0599833987653255,
        },
        {
          features: [
            [5, 11, 6, 3, -1],
            [8, 11, 3, 3, 2],
          ],
          threshold: 0.023517120629549,
          right_val: -0.4049243927001953,
          left_val: 0.0241097006946802,
        },
        {
          features: [
            [7, 16, 1, 3, -1],
            [7, 17, 1, 1, 3],
          ],
          threshold: -0.0035689130891114473,
          right_val: -0.034295879304409,
          left_val: 0.3190355896949768,
        },
        {
          features: [
            [0, 16, 2, 1, -1],
            [1, 16, 1, 1, 2],
          ],
          threshold: -0.0002819300862029195,
          right_val: 0.0706698969006538,
          left_val: -0.148741602897644,
        },
        {
          features: [
            [11, 7, 9, 6, -1],
            [11, 10, 9, 3, 2],
          ],
          threshold: 0.1021585986018181,
          right_val: -0.7784854173660278,
          left_val: 0.0128405001014471,
        },
        {
          features: [
            [9, 4, 9, 16, -1],
            [12, 4, 3, 16, 3],
          ],
          threshold: -0.1917548030614853,
          right_val: 0.0105877602472901,
          left_val: -0.7570657730102539,
        },
        {
          features: [
            [14, 12, 5, 3, -1],
            [14, 13, 5, 1, 3],
          ],
          threshold: 0.005316265858709812,
          right_val: 0.2605018019676209,
          left_val: -0.0400665700435638,
        },
        {
          features: [
            [8, 18, 3, 2, -1],
            [9, 18, 1, 2, 3],
          ],
          threshold: -0.0011487120063975453,
          right_val: 0.0616104304790497,
          left_val: -0.1801722049713135,
        },
        {
          features: [
            [4, 0, 11, 16, -1],
            [4, 8, 11, 8, 2],
          ],
          threshold: -0.28316730260849,
          right_val: 0.0116471396759152,
          left_val: -0.849134087562561,
        },
        {
          features: [
            [2, 4, 12, 15, -1],
            [2, 9, 12, 5, 3],
          ],
          threshold: 0.0337317585945129,
          right_val: -0.0774822309613228,
          left_val: 0.1235760971903801,
        },
        {
          features: [
            [3, 13, 11, 4, -1],
            [3, 15, 11, 2, 2],
          ],
          threshold: 0.0098635945469141,
          right_val: -0.2554177939891815,
          left_val: 0.0439580306410789,
        },
        {
          features: [
            [7, 5, 4, 3, -1],
            [7, 6, 4, 1, 3],
          ],
          threshold: -0.0031564768869429827,
          right_val: -0.0582210384309292,
          left_val: 0.1894298940896988,
        },
        {
          features: [
            [6, 5, 4, 3, -1],
            [6, 6, 4, 1, 3],
          ],
          threshold: 0.0015572150005027652,
          right_val: 0.1410734951496124,
          left_val: -0.1037613973021507,
        },
        {
          features: [
            [5, 0, 2, 9, -1],
            [5, 3, 2, 3, 3],
          ],
          threshold: 0.0623604208230972,
          right_val: -0.8580496907234192,
          left_val: 0.00964623223990202,
        },
        {
          features: [
            [16, 8, 2, 2, -1],
            [16, 8, 1, 1, 2],
            [17, 9, 1, 1, 2],
          ],
          threshold: 0.0001148055016528815,
          right_val: 0.1131270006299019,
          left_val: -0.0844199284911156,
        },
        {
          features: [
            [12, 10, 8, 2, -1],
            [12, 10, 4, 1, 2],
            [16, 11, 4, 1, 2],
          ],
          threshold: -0.005925273057073355,
          right_val: 0.0320798493921757,
          left_val: -0.3165077865123749,
        },
        {
          features: [
            [6, 2, 2, 8, -1],
            [7, 2, 1, 8, 2],
          ],
          threshold: -0.0002466085134074092,
          right_val: -0.110851101577282,
          left_val: 0.0886976793408394,
        },
        {
          features: [
            [6, 6, 2, 3, -1],
            [7, 6, 1, 3, 2],
          ],
          threshold: 0.0016946049872785807,
          right_val: 0.209042102098465,
          left_val: -0.0596571490168571,
        },
        {
          features: [
            [17, 4, 1, 3, -1],
            [17, 5, 1, 1, 3],
          ],
          threshold: 0.00009062325261766091,
          right_val: -0.1280633956193924,
          left_val: 0.0774419605731964,
        },
        {
          features: [
            [15, 13, 3, 2, -1],
            [16, 13, 1, 2, 3],
          ],
          threshold: 0.00116669200360775,
          right_val: 0.1570245027542114,
          left_val: -0.0617485791444778,
        },
        {
          features: [
            [11, 13, 2, 3, -1],
            [11, 14, 2, 1, 3],
          ],
          threshold: 0.001254154951311648,
          right_val: -0.2314036041498184,
          left_val: 0.0446083806455135,
        },
        {
          features: [
            [14, 5, 6, 11, -1],
            [16, 5, 2, 11, 3],
          ],
          threshold: -0.00602759001776576,
          right_val: -0.1028309017419815,
          left_val: 0.0952818468213081,
        },
        {
          features: [
            [6, 0, 12, 8, -1],
            [12, 0, 6, 8, 2],
          ],
          threshold: -0.2047284990549088,
          right_val: 0.0235375501215458,
          left_val: -0.4111475944519043,
        },
        {
          features: [
            [7, 15, 8, 4, -1],
            [7, 15, 4, 2, 2],
            [11, 17, 4, 2, 2],
          ],
          threshold: 0.0176912806928158,
          right_val: 0.2856444120407105,
          left_val: -0.0392571501433849,
        },
        {
          features: [
            [4, 14, 16, 6, -1],
            [4, 16, 16, 2, 3],
          ],
          threshold: -0.1287564933300018,
          right_val: 0.0117352902889252,
          left_val: -0.8203077912330627,
        },
        {
          features: [
            [6, 12, 2, 6, -1],
            [6, 12, 1, 3, 2],
            [7, 15, 1, 3, 2],
          ],
          threshold: 0.0012868089834228158,
          right_val: -0.1784801036119461,
          left_val: 0.0508588701486588,
        },
        {
          features: [
            [7, 14, 6, 4, -1],
            [7, 14, 3, 2, 2],
            [10, 16, 3, 2, 2],
          ],
          threshold: -0.004585983231663704,
          right_val: -0.0615825988352299,
          left_val: 0.168021097779274,
        },
        {
          features: [
            [0, 0, 2, 4, -1],
            [0, 0, 1, 2, 2],
            [1, 2, 1, 2, 2],
          ],
          threshold: 0.00046391240903176367,
          right_val: -0.1423780024051666,
          left_val: 0.0667470470070839,
        },
        {
          features: [
            [15, 12, 1, 3, -1],
            [15, 13, 1, 1, 3],
          ],
          threshold: -0.004443996120244265,
          right_val: -0.0217468105256557,
          left_val: 0.4571498036384583,
        },
        {
          features: [
            [7, 16, 3, 1, -1],
            [8, 16, 1, 1, 3],
          ],
          threshold: 0.0038220020942389965,
          right_val: -0.6024454236030579,
          left_val: 0.0180943291634321,
        },
        {
          features: [
            [1, 8, 1, 2, -1],
            [1, 9, 1, 1, 2],
          ],
          threshold: 0.0013894500443711877,
          right_val: -0.27153480052948,
          left_val: 0.0340078510344028,
        },
        {
          features: [
            [3, 14, 3, 2, -1],
            [4, 14, 1, 2, 3],
          ],
          threshold: -0.007211192976683378,
          right_val: -0.0368551313877106,
          left_val: 0.2731257081031799,
        },
        {
          features: [
            [3, 13, 3, 5, -1],
            [4, 13, 1, 5, 3],
          ],
          threshold: 0.0016509749693796039,
          right_val: 0.1313444972038269,
          left_val: -0.0844070166349411,
        },
        {
          features: [
            [7, 2, 3, 4, -1],
            [8, 2, 1, 4, 3],
          ],
          threshold: -0.0005050689214840531,
          right_val: 0.0736280530691147,
          left_val: -0.1419333964586258,
        },
        {
          features: [
            [10, 1, 4, 4, -1],
            [10, 3, 4, 2, 2],
          ],
          threshold: -0.0112053295597434,
          right_val: -0.0341713912785053,
          left_val: 0.3009375035762787,
        },
        {
          features: [
            [9, 2, 1, 2, -1],
            [9, 3, 1, 1, 2],
          ],
          threshold: -0.00034860160667449236,
          right_val: 0.0598239786922932,
          left_val: -0.2453830987215042,
        },
        {
          features: [
            [7, 12, 2, 2, -1],
            [7, 12, 1, 1, 2],
            [8, 13, 1, 1, 2],
          ],
          threshold: 0.000733472581487149,
          right_val: 0.1636794954538345,
          left_val: -0.0617702603340149,
        },
        {
          features: [
            [4, 11, 4, 4, -1],
            [4, 11, 2, 2, 2],
            [6, 13, 2, 2, 2],
          ],
          threshold: -0.009296940639615059,
          right_val: 0.0392578989267349,
          left_val: -0.3023664057254791,
        },
        {
          features: [
            [9, 10, 6, 4, -1],
            [12, 10, 3, 4, 2],
          ],
          threshold: 0.0239571202546358,
          right_val: 0.4834083020687103,
          left_val: -0.0239007193595171,
        },
        {
          features: [
            [8, 12, 3, 2, -1],
            [9, 12, 1, 2, 3],
          ],
          threshold: 0.000036422210541786626,
          right_val: 0.0912589505314827,
          left_val: -0.1228303983807564,
        },
        {
          features: [
            [13, 9, 6, 6, -1],
            [13, 9, 3, 3, 2],
            [16, 12, 3, 3, 2],
          ],
          threshold: 0.050458200275898,
          right_val: -0.7782772779464722,
          left_val: 0.0135291498154402,
        },
        {
          features: [
            [14, 0, 3, 5, -1],
            [15, 0, 1, 5, 3],
          ],
          threshold: -0.009868398308753967,
          right_val: 0.0204043593257666,
          left_val: -0.4406045973300934,
        },
        {
          features: [
            [9, 8, 6, 4, -1],
            [9, 8, 3, 2, 2],
            [12, 10, 3, 2, 2],
          ],
          threshold: -0.010851239785552,
          right_val: -0.0522485896945,
          left_val: 0.2016550004482269,
        },
        {
          features: [
            [10, 6, 3, 3, -1],
            [11, 6, 1, 3, 3],
          ],
          threshold: 0.0001767093053786084,
          right_val: 0.0831705927848816,
          left_val: -0.1369144022464752,
        },
        {
          features: [
            [13, 3, 2, 1, -1],
            [14, 3, 1, 1, 2],
          ],
          threshold: 0.00012582179624587297,
          right_val: -0.165427103638649,
          left_val: 0.0612753517925739,
        },
        {
          features: [
            [4, 5, 2, 2, -1],
            [4, 5, 1, 1, 2],
            [5, 6, 1, 1, 2],
          ],
          threshold: -0.0007058897172100842,
          right_val: -0.0661646202206612,
          left_val: 0.1521912962198257,
        },
        {
          features: [
            [4, 5, 2, 2, -1],
            [4, 5, 1, 1, 2],
            [5, 6, 1, 1, 2],
          ],
          threshold: 0.0011355109745636582,
          right_val: 0.2131109982728958,
          left_val: -0.0541153699159622,
        },
        {
          features: [
            [7, 9, 2, 6, -1],
            [7, 11, 2, 2, 3],
          ],
          threshold: -0.0037436310667544603,
          right_val: 0.0495910011231899,
          left_val: -0.2346985042095184,
        },
        {
          features: [
            [6, 12, 2, 3, -1],
            [6, 13, 2, 1, 3],
          ],
          threshold: 0.001230926951393485,
          right_val: 0.1464654058218002,
          left_val: -0.0751960128545761,
        },
        {
          features: [
            [6, 13, 2, 3, -1],
            [6, 14, 2, 1, 3],
          ],
          threshold: 0.0003622894873842597,
          right_val: 0.1209172978997231,
          left_val: -0.0977894067764282,
        },
        {
          features: [
            [7, 4, 3, 2, -1],
            [8, 4, 1, 2, 3],
          ],
          threshold: 0.0007599618984386325,
          right_val: -0.1627878993749619,
          left_val: 0.0697139203548431,
        },
        {
          features: [
            [13, 1, 3, 4, -1],
            [14, 1, 1, 4, 3],
          ],
          threshold: -0.0018509250367060304,
          right_val: 0.0575015209615231,
          left_val: -0.1838289052248001,
        },
        {
          features: [
            [6, 8, 11, 3, -1],
            [6, 9, 11, 1, 3],
          ],
          threshold: 0.007953967899084091,
          right_val: 0.1884644031524658,
          left_val: -0.0588487088680267,
        },
        {
          features: [
            [13, 10, 5, 2, -1],
            [13, 11, 5, 1, 2],
          ],
          threshold: -0.00031013600528240204,
          right_val: 0.0724031999707222,
          left_val: -0.1457546055316925,
        },
        {
          features: [
            [13, 9, 3, 6, -1],
            [13, 12, 3, 3, 2],
          ],
          threshold: 0.0016956350300461054,
          right_val: -0.1674093008041382,
          left_val: 0.070550262928009,
        },
        {
          features: [
            [3, 14, 5, 2, -1],
            [3, 15, 5, 1, 2],
          ],
          threshold: 0.000029058079235255718,
          right_val: 0.0953762829303741,
          left_val: -0.1034158989787102,
        },
        {
          features: [
            [11, 0, 8, 2, -1],
            [11, 0, 4, 1, 2],
            [15, 1, 4, 1, 2],
          ],
          threshold: 0.0144669199362397,
          right_val: 0.5476716756820679,
          left_val: -0.0175320692360401,
        },
        {
          features: [
            [13, 1, 7, 6, -1],
            [13, 3, 7, 2, 3],
          ],
          threshold: -0.0571564994752407,
          right_val: 0.0163944195955992,
          left_val: -0.7478930950164795,
        },
        {
          features: [
            [11, 0, 6, 1, -1],
            [13, 0, 2, 1, 3],
          ],
          threshold: 0.0030681469943374395,
          right_val: -0.2416436970233917,
          left_val: 0.0387028194963932,
        },
        {
          features: [
            [8, 1, 5, 3, -1],
            [8, 2, 5, 1, 3],
          ],
          threshold: 0.0037490210961550474,
          right_val: 0.2030832022428513,
          left_val: -0.0565554313361645,
        },
        {
          features: [
            [12, 11, 1, 3, -1],
            [12, 12, 1, 1, 3],
          ],
          threshold: -0.0010643450077623129,
          right_val: 0.0352075099945068,
          left_val: -0.2821192145347595,
        },
        {
          features: [
            [17, 13, 3, 6, -1],
            [17, 15, 3, 2, 3],
          ],
          threshold: -0.00898074358701706,
          right_val: -0.0506281815469265,
          left_val: 0.2175476998090744,
        },
        {
          features: [
            [12, 11, 1, 3, -1],
            [12, 12, 1, 1, 3],
          ],
          threshold: 0.00024643479264341295,
          right_val: -0.1476881951093674,
          left_val: 0.0727275311946869,
        },
        {
          features: [
            [15, 9, 3, 1, -1],
            [16, 9, 1, 1, 3],
          ],
          threshold: 0.0022197801154106855,
          right_val: 0.2693927884101868,
          left_val: -0.0367548614740372,
        },
      ],
      threshold: -1.478559970855713,
    },
    {
      simpleClassifiers: [
        {
          features: [
            [10, 4, 6, 11, -1],
            [13, 4, 3, 11, 2],
          ],
          threshold: -0.035328421741724,
          right_val: -0.2796190083026886,
          left_val: 0.2412399053573608,
        },
        {
          features: [
            [13, 9, 4, 4, -1],
            [13, 9, 2, 2, 2],
            [15, 11, 2, 2, 2],
          ],
          threshold: 0.002682984108105302,
          right_val: 0.2343350052833557,
          left_val: -0.1636255979537964,
        },
        {
          features: [
            [8, 2, 1, 6, -1],
            [8, 4, 1, 2, 3],
          ],
          threshold: 0.002133037894964218,
          right_val: 0.1567952930927277,
          left_val: -0.2010063976049423,
        },
        {
          features: [
            [5, 6, 4, 6, -1],
            [5, 9, 4, 3, 2],
          ],
          threshold: 0.0004297287086956203,
          right_val: 0.0740836933255196,
          left_val: -0.3779098093509674,
        },
        {
          features: [
            [2, 6, 4, 8, -1],
            [4, 6, 2, 8, 2],
          ],
          threshold: -0.0346459187567234,
          right_val: -0.0835465267300606,
          left_val: 0.3055624067783356,
        },
        {
          features: [
            [11, 15, 1, 2, -1],
            [11, 16, 1, 1, 2],
          ],
          threshold: -0.000014237920368032064,
          right_val: -0.2358395010232925,
          left_val: 0.08269914239645,
        },
        {
          features: [
            [11, 1, 7, 10, -1],
            [11, 6, 7, 5, 2],
          ],
          threshold: 0.004916511010378599,
          right_val: 0.0969653874635696,
          left_val: -0.1955605000257492,
        },
        {
          features: [
            [7, 11, 9, 6, -1],
            [7, 13, 9, 2, 3],
          ],
          threshold: 0.006098948884755373,
          right_val: -0.232096403837204,
          left_val: 0.0784705504775047,
        },
        {
          features: [
            [4, 9, 8, 1, -1],
            [8, 9, 4, 1, 2],
          ],
          threshold: 0.007487418130040169,
          right_val: -0.5156626105308533,
          left_val: 0.007172591984272003,
        },
        {
          features: [
            [10, 10, 3, 3, -1],
            [11, 10, 1, 3, 3],
          ],
          threshold: 0.00428719911724329,
          right_val: -0.4108628928661346,
          left_val: 0.0405305102467537,
        },
        {
          features: [
            [8, 0, 7, 6, -1],
            [8, 2, 7, 2, 3],
          ],
          threshold: 0.0168561805039644,
          right_val: 0.2365777939558029,
          left_val: -0.0775062665343285,
        },
        {
          features: [
            [11, 13, 2, 2, -1],
            [11, 13, 1, 1, 2],
            [12, 14, 1, 1, 2],
          ],
          threshold: -0.0010347689967602491,
          right_val: 0.0344685688614845,
          left_val: -0.4670444130897522,
        },
        {
          features: [
            [7, 12, 1, 3, -1],
            [7, 13, 1, 1, 3],
          ],
          threshold: 0.0016820980235934258,
          right_val: 0.2367143034934998,
          left_val: -0.0672067403793335,
        },
        {
          features: [
            [7, 10, 3, 9, -1],
            [7, 13, 3, 3, 3],
          ],
          threshold: -0.012018240056932,
          right_val: 0.0742819532752037,
          left_val: -0.2237260043621063,
        },
        {
          features: [
            [5, 9, 1, 3, -1],
            [5, 10, 1, 1, 3],
          ],
          threshold: 0.0013802549801766872,
          right_val: 0.1527086049318314,
          left_val: -0.09999018907547,
        },
        {
          features: [
            [2, 8, 18, 6, -1],
            [11, 8, 9, 6, 2],
          ],
          threshold: -0.1428107023239136,
          right_val: 0.0622993484139442,
          left_val: -0.2834411859512329,
        },
        {
          features: [
            [11, 7, 6, 4, -1],
            [13, 7, 2, 4, 3],
          ],
          threshold: -0.0154634900391102,
          right_val: -0.053395688533783,
          left_val: 0.2908419072628021,
        },
        {
          features: [
            [7, 8, 4, 6, -1],
            [7, 10, 4, 2, 3],
          ],
          threshold: -0.0009961719624698162,
          right_val: 0.0419229716062546,
          left_val: -0.3601182103157044,
        },
        {
          features: [
            [10, 4, 4, 6, -1],
            [10, 6, 4, 2, 3],
          ],
          threshold: -0.0269566792994738,
          right_val: 0.031731128692627,
          left_val: -0.4373672902584076,
        },
        {
          features: [
            [11, 12, 6, 1, -1],
            [13, 12, 2, 1, 3],
          ],
          threshold: -0.008778061717748642,
          right_val: 0.0251468494534492,
          left_val: -0.5037447214126587,
        },
        {
          features: [
            [5, 7, 2, 1, -1],
            [6, 7, 1, 1, 2],
          ],
          threshold: 0.000042969950300175697,
          right_val: 0.0884783565998077,
          left_val: -0.1540649980306625,
        },
        {
          features: [
            [5, 12, 3, 3, -1],
            [5, 13, 3, 1, 3],
          ],
          threshold: -0.006261905189603567,
          right_val: -0.0598498210310936,
          left_val: 0.2243591994047165,
        },
        {
          features: [
            [16, 17, 1, 2, -1],
            [16, 18, 1, 1, 2],
          ],
          threshold: -0.0006429677014239132,
          right_val: 0.059389740228653,
          left_val: -0.2437708973884583,
        },
        {
          features: [
            [1, 0, 2, 1, -1],
            [2, 0, 1, 1, 2],
          ],
          threshold: -0.00015573870041407645,
          right_val: 0.0784763172268867,
          left_val: -0.1686799973249435,
        },
        {
          features: [
            [5, 12, 2, 2, -1],
            [5, 13, 2, 1, 2],
          ],
          threshold: 0.00041139780660159886,
          right_val: 0.1401938050985336,
          left_val: -0.0890175700187683,
        },
        {
          features: [
            [12, 13, 2, 3, -1],
            [12, 14, 2, 1, 3],
          ],
          threshold: 0.0018635790329426527,
          right_val: -0.3211897015571594,
          left_val: 0.0386036895215511,
        },
        {
          features: [
            [5, 11, 3, 3, -1],
            [5, 12, 3, 1, 3],
          ],
          threshold: 0.0016059159534052014,
          right_val: 0.1580146998167038,
          left_val: -0.0788015201687813,
        },
        {
          features: [
            [1, 0, 2, 1, -1],
            [2, 0, 1, 1, 2],
          ],
          threshold: 0.0008674007840454578,
          right_val: -0.2353843003511429,
          left_val: 0.0541344806551933,
        },
        {
          features: [
            [16, 0, 4, 4, -1],
            [16, 0, 2, 2, 2],
            [18, 2, 2, 2, 2],
          ],
          threshold: -0.000798010325524956,
          right_val: -0.0957318171858788,
          left_val: 0.1333000957965851,
        },
        {
          features: [
            [4, 5, 8, 10, -1],
            [4, 5, 4, 5, 2],
            [8, 10, 4, 5, 2],
          ],
          threshold: -0.0048548211343586445,
          right_val: 0.0610386207699776,
          left_val: -0.2073605954647064,
        },
        {
          features: [
            [3, 14, 4, 5, -1],
            [5, 14, 2, 5, 2],
          ],
          threshold: -0.0114267403259873,
          right_val: -0.0711522772908211,
          left_val: 0.1720180958509445,
        },
        {
          features: [
            [2, 16, 6, 2, -1],
            [5, 16, 3, 2, 2],
          ],
          threshold: 0.008706249296665192,
          right_val: 0.1908296942710877,
          left_val: -0.0721856728196144,
        },
        {
          features: [
            [8, 0, 8, 1, -1],
            [12, 0, 4, 1, 2],
          ],
          threshold: -0.0011634400580078363,
          right_val: 0.091818131506443,
          left_val: -0.1375169008970261,
        },
        {
          features: [
            [0, 4, 15, 6, -1],
            [0, 7, 15, 3, 2],
          ],
          threshold: 0.006891461089253426,
          right_val: -0.1324615925550461,
          left_val: 0.0962259694933891,
        },
        {
          features: [
            [9, 9, 3, 2, -1],
            [9, 10, 3, 1, 2],
          ],
          threshold: -0.002242662012577057,
          right_val: -0.0362800508737564,
          left_val: 0.3568324148654938,
        },
        {
          features: [
            [7, 9, 2, 6, -1],
            [7, 11, 2, 2, 3],
          ],
          threshold: 0.0123015204444528,
          right_val: -0.306233286857605,
          left_val: 0.046940989792347,
        },
        {
          features: [
            [5, 10, 4, 3, -1],
            [5, 11, 4, 1, 3],
          ],
          threshold: 0.003996361047029495,
          right_val: 0.1548645943403244,
          left_val: -0.0829993933439255,
        },
        {
          features: [
            [12, 10, 1, 2, -1],
            [12, 11, 1, 1, 2],
          ],
          threshold: -0.000022026189981261268,
          right_val: -0.1189965009689331,
          left_val: 0.1177809983491898,
        },
        {
          features: [
            [17, 3, 1, 3, -1],
            [17, 4, 1, 1, 3],
          ],
          threshold: 0.0005870827008038759,
          right_val: -0.2250989973545075,
          left_val: 0.0568646602332592,
        },
        {
          features: [
            [11, 9, 4, 4, -1],
            [11, 9, 2, 2, 2],
            [13, 11, 2, 2, 2],
          ],
          threshold: -0.005876012146472931,
          right_val: -0.0445701293647289,
          left_val: 0.2662526965141296,
        },
        {
          features: [
            [10, 14, 6, 2, -1],
            [10, 15, 6, 1, 2],
          ],
          threshold: 0.0004326213093008846,
          right_val: -0.2117380052804947,
          left_val: 0.0580498389899731,
        },
        {
          features: [
            [11, 12, 2, 8, -1],
            [11, 16, 2, 4, 2],
          ],
          threshold: 0.0047852578572928905,
          right_val: 0.2950912117958069,
          left_val: -0.0407105684280396,
        },
        {
          features: [
            [11, 7, 5, 6, -1],
            [11, 10, 5, 3, 2],
          ],
          threshold: 0.000045480159315047786,
          right_val: 0.0601795390248299,
          left_val: -0.1820161044597626,
        },
        {
          features: [
            [4, 2, 2, 6, -1],
            [5, 2, 1, 6, 2],
          ],
          threshold: 0.0025633929762989283,
          right_val: 0.1269284039735794,
          left_val: -0.0870397612452507,
        },
        {
          features: [
            [6, 0, 5, 2, -1],
            [6, 1, 5, 1, 2],
          ],
          threshold: -0.004738347139209509,
          right_val: -0.04991490021348,
          left_val: 0.2396183013916016,
        },
        {
          features: [
            [10, 17, 4, 3, -1],
            [10, 18, 4, 1, 3],
          ],
          threshold: 0.004464723169803619,
          right_val: -0.3246757090091705,
          left_val: 0.0405400209128857,
        },
        {
          features: [
            [12, 3, 7, 3, -1],
            [12, 4, 7, 1, 3],
          ],
          threshold: -0.006706120911985636,
          right_val: 0.0322996489703655,
          left_val: -0.3278968036174774,
        },
        {
          features: [
            [8, 1, 12, 8, -1],
            [8, 1, 6, 4, 2],
            [14, 5, 6, 4, 2],
          ],
          threshold: 0.0717610493302345,
          right_val: 0.4777205884456635,
          left_val: -0.0237136706709862,
        },
        {
          features: [
            [11, 0, 3, 20, -1],
            [12, 0, 1, 20, 3],
          ],
          threshold: 0.0305848605930805,
          right_val: -0.7806122899055481,
          left_val: 0.0167939104139805,
        },
        {
          features: [
            [17, 1, 2, 2, -1],
            [17, 1, 1, 1, 2],
            [18, 2, 1, 1, 2],
          ],
          threshold: 0.003867266932502389,
          right_val: 0.5126066207885742,
          left_val: -0.0248768907040358,
        },
        {
          features: [
            [2, 10, 7, 6, -1],
            [2, 12, 7, 2, 3],
          ],
          threshold: -0.0528022088110447,
          right_val: 0.0238730404525995,
          left_val: -0.5075966119766235,
        },
        {
          features: [
            [7, 3, 3, 1, -1],
            [8, 3, 1, 1, 3],
          ],
          threshold: -0.0006565158255398273,
          right_val: 0.0496728010475636,
          left_val: -0.20122329890728,
        },
        {
          features: [
            [4, 17, 11, 3, -1],
            [4, 18, 11, 1, 3],
          ],
          threshold: 0.00857852678745985,
          right_val: 0.2351890951395035,
          left_val: -0.0450070202350616,
        },
        {
          features: [
            [7, 15, 3, 2, -1],
            [8, 15, 1, 2, 3],
          ],
          threshold: -0.0012620680499821901,
          right_val: 0.05556420981884,
          left_val: -0.1996205002069473,
        },
        {
          features: [
            [3, 4, 3, 13, -1],
            [4, 4, 1, 13, 3],
          ],
          threshold: 0.0142152896150947,
          right_val: 0.2078115046024323,
          left_val: -0.0469839796423912,
        },
        {
          features: [
            [5, 2, 12, 14, -1],
            [5, 2, 6, 7, 2],
            [11, 9, 6, 7, 2],
          ],
          threshold: 0.1639381051063538,
          right_val: -0.650256872177124,
          left_val: 0.0149732697755098,
        },
        {
          features: [
            [0, 0, 10, 6, -1],
            [0, 3, 10, 3, 2],
          ],
          threshold: 0.1483764052391052,
          right_val: -0.9429618716239929,
          left_val: 0.008188588544726372,
        },
        {
          features: [
            [5, 4, 2, 1, -1],
            [6, 4, 1, 1, 2],
          ],
          threshold: 0.000014631190424552187,
          right_val: 0.0824895799160004,
          left_val: -0.1238375976681709,
        },
        {
          features: [
            [7, 7, 6, 13, -1],
            [10, 7, 3, 13, 2],
          ],
          threshold: -0.0339093916118145,
          right_val: 0.0433024987578392,
          left_val: -0.2281876057386398,
        },
        {
          features: [
            [7, 2, 2, 8, -1],
            [7, 2, 1, 4, 2],
            [8, 6, 1, 4, 2],
          ],
          threshold: 0.003828858956694603,
          right_val: 0.2761304974555969,
          left_val: -0.0372769199311733,
        },
        {
          features: [
            [6, 1, 3, 4, -1],
            [7, 1, 1, 4, 3],
          ],
          threshold: 0.008094791322946548,
          right_val: -0.3938880860805512,
          left_val: 0.0284453593194485,
        },
        {
          features: [
            [7, 8, 2, 1, -1],
            [8, 8, 1, 1, 2],
          ],
          threshold: -0.0007001960184425116,
          right_val: -0.0927142575383186,
          left_val: 0.1219938024878502,
        },
        {
          features: [
            [4, 0, 4, 2, -1],
            [4, 0, 2, 1, 2],
            [6, 1, 2, 1, 2],
          ],
          threshold: 0.003441249020397663,
          right_val: 0.206172302365303,
          left_val: -0.0489726811647415,
        },
        {
          features: [
            [3, 10, 16, 8, -1],
            [3, 14, 16, 4, 2],
          ],
          threshold: -0.1633749008178711,
          right_val: 0.0164678208529949,
          left_val: -0.6185023784637451,
        },
        {
          features: [
            [10, 5, 5, 10, -1],
            [10, 10, 5, 5, 2],
          ],
          threshold: 0.00656407093629241,
          right_val: -0.0923400074243546,
          left_val: 0.1100718975067139,
        },
        {
          features: [
            [13, 6, 3, 4, -1],
            [13, 8, 3, 2, 2],
          ],
          threshold: 0.0004470883868634701,
          right_val: 0.0770396962761879,
          left_val: -0.1393330991268158,
        },
        {
          features: [
            [13, 10, 5, 3, -1],
            [13, 11, 5, 1, 3],
          ],
          threshold: 0.0175687000155449,
          right_val: -0.8003290295600891,
          left_val: 0.009756969287991524,
        },
        {
          features: [
            [16, 12, 2, 2, -1],
            [16, 12, 1, 1, 2],
            [17, 13, 1, 1, 2],
          ],
          threshold: -0.0019571769516915083,
          right_val: -0.0364282391965389,
          left_val: 0.2800033092498779,
        },
        {
          features: [
            [16, 3, 2, 1, -1],
            [17, 3, 1, 1, 2],
          ],
          threshold: 0.0005191303789615631,
          right_val: -0.1942557990550995,
          left_val: 0.0535153411328793,
        },
        {
          features: [
            [5, 1, 3, 5, -1],
            [6, 1, 1, 5, 3],
          ],
          threshold: 0.00962730310857296,
          right_val: -0.3180254101753235,
          left_val: 0.0313177518546581,
        },
        {
          features: [
            [5, 7, 8, 6, -1],
            [5, 9, 8, 2, 3],
          ],
          threshold: -0.0503328107297421,
          right_val: -0.0184949804097414,
          left_val: 0.5665906071662903,
        },
        {
          features: [
            [6, 10, 8, 2, -1],
            [6, 10, 4, 1, 2],
            [10, 11, 4, 1, 2],
          ],
          threshold: -0.006462490186095238,
          right_val: 0.0273508504033089,
          left_val: -0.4189467132091522,
        },
        {
          features: [
            [6, 9, 4, 8, -1],
            [6, 9, 2, 4, 2],
            [8, 13, 2, 4, 2],
          ],
          threshold: -0.005285724997520447,
          right_val: -0.0583777390420437,
          left_val: 0.1775650978088379,
        },
        {
          features: [
            [0, 7, 8, 4, -1],
            [4, 7, 4, 4, 2],
          ],
          threshold: 0.0994544625282288,
          right_val: -0.5852617025375366,
          left_val: 0.0164877194911242,
        },
        {
          features: [
            [14, 13, 2, 6, -1],
            [14, 13, 1, 3, 2],
            [15, 16, 1, 3, 2],
          ],
          threshold: 0.00021917840058449656,
          right_val: 0.0918841734528542,
          left_val: -0.1071425005793572,
        },
        {
          features: [
            [12, 13, 2, 1, -1],
            [13, 13, 1, 1, 2],
          ],
          threshold: -0.00004387335866340436,
          right_val: -0.1272391974925995,
          left_val: 0.0780369266867638,
        },
        {
          features: [
            [6, 8, 2, 2, -1],
            [6, 9, 2, 1, 2],
          ],
          threshold: -0.0006722764228470623,
          right_val: 0.0388433784246445,
          left_val: -0.2570942044258118,
        },
        {
          features: [
            [15, 12, 2, 1, -1],
            [16, 12, 1, 1, 2],
          ],
          threshold: 0.00011754270235542208,
          right_val: 0.120939701795578,
          left_val: -0.079695962369442,
        },
        {
          features: [
            [0, 0, 18, 14, -1],
            [0, 7, 18, 7, 2],
          ],
          threshold: 0.4606119096279144,
          right_val: -0.6524127125740051,
          left_val: 0.0138860698789358,
        },
        {
          features: [
            [11, 5, 3, 3, -1],
            [12, 5, 1, 3, 3],
          ],
          threshold: 0.0111156003549695,
          right_val: -0.6022251844406128,
          left_val: 0.0138716604560614,
        },
        {
          features: [
            [4, 7, 3, 3, -1],
            [5, 7, 1, 3, 3],
          ],
          threshold: 0.0090776477009058,
          right_val: 0.2570241987705231,
          left_val: -0.0361186601221561,
        },
        {
          features: [
            [4, 8, 3, 1, -1],
            [5, 8, 1, 1, 3],
          ],
          threshold: -0.0004959754878655076,
          right_val: -0.0892495065927505,
          left_val: 0.1101704984903336,
        },
        {
          features: [
            [5, 9, 1, 8, -1],
            [5, 13, 1, 4, 2],
          ],
          threshold: 0.0015807070303708315,
          right_val: -0.2021591067314148,
          left_val: 0.0481312796473503,
        },
        {
          features: [
            [4, 2, 3, 15, -1],
            [5, 2, 1, 15, 3],
          ],
          threshold: -0.0690129324793816,
          right_val: 0.0106600103899837,
          left_val: -0.8153606057167053,
        },
        {
          features: [
            [15, 0, 4, 4, -1],
            [17, 0, 2, 4, 2],
          ],
          threshold: 0.00019330780196469277,
          right_val: 0.0850464329123497,
          left_val: -0.1123182997107506,
        },
        {
          features: [
            [10, 7, 1, 3, -1],
            [10, 8, 1, 1, 3],
          ],
          threshold: 0.0007881320780143142,
          right_val: 0.1765443980693817,
          left_val: -0.055200818926096,
        },
        {
          features: [
            [8, 17, 3, 2, -1],
            [9, 17, 1, 2, 3],
          ],
          threshold: 0.0009536712896078825,
          right_val: -0.1867419928312302,
          left_val: 0.0544111989438534,
        },
        {
          features: [
            [8, 17, 3, 2, -1],
            [9, 17, 1, 2, 3],
          ],
          threshold: -0.0023191540967673063,
          right_val: 0.038513321429491,
          left_val: -0.2754440903663635,
        },
        {
          features: [
            [10, 6, 1, 3, -1],
            [10, 7, 1, 1, 3],
          ],
          threshold: 0.0009508795919828117,
          right_val: 0.1608213931322098,
          left_val: -0.0682189017534256,
        },
        {
          features: [
            [6, 7, 4, 4, -1],
            [6, 7, 2, 2, 2],
            [8, 9, 2, 2, 2],
          ],
          threshold: 0.00953851081430912,
          right_val: 0.3037083148956299,
          left_val: -0.0388268791139126,
        },
        {
          features: [
            [8, 7, 4, 4, -1],
            [8, 7, 2, 2, 2],
            [10, 9, 2, 2, 2],
          ],
          threshold: -0.0144891897216439,
          right_val: 0.0235500205308199,
          left_val: -0.4698973000049591,
        },
        {
          features: [
            [15, 8, 2, 7, -1],
            [16, 8, 1, 7, 2],
          ],
          threshold: 0.0107560502365232,
          right_val: -0.4724313020706177,
          left_val: 0.0205651000142097,
        },
        {
          features: [
            [8, 3, 3, 2, -1],
            [9, 3, 1, 2, 3],
          ],
          threshold: -0.0020074830390512943,
          right_val: 0.0360215492546558,
          left_val: -0.279466986656189,
        },
        {
          features: [
            [16, 17, 3, 1, -1],
            [17, 17, 1, 1, 3],
          ],
          threshold: -0.0017316909506917,
          right_val: -0.0463009811937809,
          left_val: 0.2090279012918472,
        },
        {
          features: [
            [3, 2, 12, 14, -1],
            [3, 2, 6, 7, 2],
            [9, 9, 6, 7, 2],
          ],
          threshold: 0.1523479968309403,
          right_val: -0.6046112775802612,
          left_val: 0.0149342501536012,
        },
        {
          features: [
            [16, 16, 1, 2, -1],
            [16, 17, 1, 1, 2],
          ],
          threshold: 0.0006334087811410427,
          right_val: -0.1827719956636429,
          left_val: 0.0503071509301662,
        },
        {
          features: [
            [7, 12, 2, 3, -1],
            [7, 13, 2, 1, 3],
          ],
          threshold: -0.008279391564428806,
          right_val: -0.0264742895960808,
          left_val: 0.3646303117275238,
        },
        {
          features: [
            [7, 13, 2, 6, -1],
            [8, 13, 1, 6, 2],
          ],
          threshold: 0.0136676700785756,
          right_val: -0.8902382850646973,
          left_val: 0.012511620298028,
        },
        {
          features: [
            [8, 14, 2, 6, -1],
            [8, 16, 2, 2, 3],
          ],
          threshold: 0.0020979309920221567,
          right_val: 0.1298995018005371,
          left_val: -0.0802471935749054,
        },
        {
          features: [
            [6, 14, 4, 6, -1],
            [6, 16, 4, 2, 3],
          ],
          threshold: -0.008977656252682209,
          right_val: -0.0617711097002029,
          left_val: 0.1741108000278473,
        },
        {
          features: [
            [11, 12, 3, 6, -1],
            [12, 12, 1, 6, 3],
          ],
          threshold: 0.0012094390112906694,
          right_val: -0.1656129062175751,
          left_val: 0.0687117204070091,
        },
        {
          features: [
            [0, 6, 1, 12, -1],
            [0, 10, 1, 4, 3],
          ],
          threshold: 0.0068200258538126945,
          right_val: -0.1823161989450455,
          left_val: 0.0577957592904568,
        },
        {
          features: [
            [3, 3, 2, 10, -1],
            [3, 3, 1, 5, 2],
            [4, 8, 1, 5, 2],
          ],
          threshold: -0.0018268059939146042,
          right_val: -0.0753439664840698,
          left_val: 0.1334033012390137,
        },
        {
          features: [
            [3, 3, 2, 8, -1],
            [3, 3, 1, 4, 2],
            [4, 7, 1, 4, 2],
          ],
          threshold: 0.007990840822458267,
          right_val: 0.2459415942430496,
          left_val: -0.045094471424818,
        },
        {
          features: [
            [9, 4, 1, 12, -1],
            [9, 10, 1, 6, 2],
          ],
          threshold: -0.002526204101741314,
          right_val: 0.0523341298103333,
          left_val: -0.2076396048069,
        },
        {
          features: [
            [0, 5, 6, 4, -1],
            [3, 5, 3, 4, 2],
          ],
          threshold: -0.0748255103826523,
          right_val: 0.0178033895790577,
          left_val: -0.5468875765800476,
        },
        {
          features: [
            [9, 9, 1, 4, -1],
            [9, 11, 1, 2, 2],
          ],
          threshold: -0.0033099399879574776,
          right_val: -0.0289664193987846,
          left_val: 0.3345581889152527,
        },
        {
          features: [
            [4, 6, 6, 4, -1],
            [4, 6, 3, 2, 2],
            [7, 8, 3, 2, 2],
          ],
          threshold: 0.008227627724409103,
          right_val: -0.2665227055549622,
          left_val: 0.0415798611938953,
        },
        {
          features: [
            [6, 8, 2, 2, -1],
            [7, 8, 1, 2, 2],
          ],
          threshold: 0.0031686299480497837,
          right_val: 0.2976978123188019,
          left_val: -0.0418171100318432,
        },
        {
          features: [
            [6, 4, 4, 14, -1],
            [8, 4, 2, 14, 2],
          ],
          threshold: 0.0151702901348472,
          right_val: -0.2461796998977661,
          left_val: 0.0433923602104187,
        },
        {
          features: [
            [6, 7, 3, 3, -1],
            [7, 7, 1, 3, 3],
          ],
          threshold: -0.0015946379862725735,
          right_val: -0.0730177387595177,
          left_val: 0.1505718976259232,
        },
        {
          features: [
            [4, 7, 6, 5, -1],
            [7, 7, 3, 5, 2],
          ],
          threshold: -0.008522635325789452,
          right_val: 0.0696560367941856,
          left_val: -0.1505008041858673,
        },
        {
          features: [
            [0, 4, 8, 10, -1],
            [4, 4, 4, 10, 2],
          ],
          threshold: -0.0114181200042367,
          right_val: -0.095122329890728,
          left_val: 0.1297474950551987,
        },
        {
          features: [
            [0, 6, 18, 14, -1],
            [9, 6, 9, 14, 2],
          ],
          threshold: -0.288563996553421,
          right_val: 0.0474108196794987,
          left_val: -0.2112454026937485,
        },
        {
          features: [
            [11, 15, 3, 5, -1],
            [12, 15, 1, 5, 3],
          ],
          threshold: -0.003901422955095768,
          right_val: 0.0386986583471298,
          left_val: -0.2684378027915955,
        },
        {
          features: [
            [3, 18, 4, 2, -1],
            [3, 18, 2, 1, 2],
            [5, 19, 2, 1, 2],
          ],
          threshold: -0.0035567739978432655,
          right_val: -0.045723881572485,
          left_val: 0.2338503003120422,
        },
        {
          features: [
            [7, 10, 2, 2, -1],
            [7, 11, 2, 1, 2],
          ],
          threshold: -0.006439412944018841,
          right_val: 0.0161560494452715,
          left_val: -0.6046388149261475,
        },
        {
          features: [
            [10, 1, 3, 10, -1],
            [10, 6, 3, 5, 2],
          ],
          threshold: -0.007486131973564625,
          right_val: -0.0559758804738522,
          left_val: 0.1686796993017197,
        },
        {
          features: [
            [9, 0, 8, 10, -1],
            [13, 0, 4, 10, 2],
          ],
          threshold: 0.0002362121012993157,
          right_val: -0.2187291979789734,
          left_val: 0.0535967499017715,
        },
        {
          features: [
            [7, 2, 8, 13, -1],
            [11, 2, 4, 13, 2],
          ],
          threshold: 0.0260992497205734,
          right_val: 0.2272893041372299,
          left_val: -0.053937491029501,
        },
        {
          features: [
            [3, 3, 12, 7, -1],
            [9, 3, 6, 7, 2],
          ],
          threshold: -0.001780975959263742,
          right_val: -0.1200997978448868,
          left_val: 0.0867595225572586,
        },
        {
          features: [
            [11, 8, 3, 2, -1],
            [12, 8, 1, 2, 3],
          ],
          threshold: -0.00011987469770247117,
          right_val: 0.0707077831029892,
          left_val: -0.1534754931926727,
        },
        {
          features: [
            [11, 7, 2, 8, -1],
            [11, 7, 1, 4, 2],
            [12, 11, 1, 4, 2],
          ],
          threshold: -0.0068248361349105835,
          right_val: 0.0267799608409405,
          left_val: -0.3734101951122284,
        },
        {
          features: [
            [0, 6, 3, 2, -1],
            [0, 7, 3, 1, 2],
          ],
          threshold: -0.00013119089999236166,
          right_val: 0.0872111618518829,
          left_val: -0.1164086982607842,
        },
        {
          features: [
            [6, 17, 2, 3, -1],
            [6, 18, 2, 1, 3],
          ],
          threshold: -0.0018228540429845452,
          right_val: -0.0680060908198357,
          left_val: 0.1566449999809265,
        },
        {
          features: [
            [4, 7, 2, 2, -1],
            [4, 7, 1, 1, 2],
            [5, 8, 1, 1, 2],
          ],
          threshold: 0.0026267999783158302,
          right_val: 0.2639312148094177,
          left_val: -0.0369872190058231,
        },
        {
          features: [
            [9, 2, 10, 9, -1],
            [9, 5, 10, 3, 3],
          ],
          threshold: -0.0706771835684776,
          right_val: 0.0350355207920074,
          left_val: -0.2829599976539612,
        },
        {
          features: [
            [9, 0, 10, 4, -1],
            [9, 0, 5, 2, 2],
            [14, 2, 5, 2, 2],
          ],
          threshold: 0.0180613193660975,
          right_val: 0.3531377911567688,
          left_val: -0.0280416496098042,
        },
        {
          features: [
            [7, 5, 2, 1, -1],
            [8, 5, 1, 1, 2],
          ],
          threshold: 0.0009264940745197237,
          right_val: -0.2278853952884674,
          left_val: 0.0446002781391144,
        },
        {
          features: [
            [7, 5, 2, 1, -1],
            [8, 5, 1, 1, 2],
          ],
          threshold: -0.0005302372155711055,
          right_val: 0.062718503177166,
          left_val: -0.2086668014526367,
        },
        {
          features: [
            [4, 9, 3, 3, -1],
            [4, 10, 3, 1, 3],
          ],
          threshold: 0.003605893114581704,
          right_val: 0.1490000933408737,
          left_val: -0.0677969083189964,
        },
        {
          features: [
            [4, 10, 4, 3, -1],
            [4, 11, 4, 1, 3],
          ],
          threshold: 0.008591564372181892,
          right_val: 0.2307848036289215,
          left_val: -0.0456267595291138,
        },
        {
          features: [
            [6, 7, 2, 3, -1],
            [6, 8, 2, 1, 3],
          ],
          threshold: -0.008832935243844986,
          right_val: 0.0282306894659996,
          left_val: -0.4111708998680115,
        },
        {
          features: [
            [18, 4, 1, 3, -1],
            [18, 5, 1, 1, 3],
          ],
          threshold: 0.00040959479520097375,
          right_val: -0.1824354976415634,
          left_val: 0.053656630218029,
        },
        {
          features: [
            [17, 0, 3, 5, -1],
            [18, 0, 1, 5, 3],
          ],
          threshold: -0.0025011589750647545,
          right_val: -0.0609547011554241,
          left_val: 0.1631354987621307,
        },
        {
          features: [
            [11, 2, 8, 3, -1],
            [11, 3, 8, 1, 3],
          ],
          threshold: -0.014622169546783,
          right_val: 0.018572760745883,
          left_val: -0.4998840093612671,
        },
        {
          features: [
            [14, 9, 6, 5, -1],
            [17, 9, 3, 5, 2],
          ],
          threshold: -0.0637906789779663,
          right_val: 0.0179033894091845,
          left_val: -0.4832960069179535,
        },
        {
          features: [
            [0, 7, 4, 6, -1],
            [0, 9, 4, 2, 3],
          ],
          threshold: -0.0166711397469044,
          right_val: 0.034886009991169,
          left_val: -0.2666158974170685,
        },
        {
          features: [
            [12, 7, 4, 12, -1],
            [12, 7, 2, 6, 2],
            [14, 13, 2, 6, 2],
          ],
          threshold: -0.0125260697677732,
          right_val: -0.0280948001891375,
          left_val: 0.3406133949756622,
        },
        {
          features: [
            [8, 7, 9, 3, -1],
            [11, 7, 3, 3, 3],
          ],
          threshold: 0.0483251586556435,
          right_val: 0.2902565896511078,
          left_val: -0.0331761911511421,
        },
        {
          features: [
            [12, 12, 2, 3, -1],
            [12, 13, 2, 1, 3],
          ],
          threshold: 0.0013246550224721432,
          right_val: -0.2685065865516663,
          left_val: 0.0371814407408237,
        },
        {
          features: [
            [11, 0, 6, 20, -1],
            [14, 0, 3, 20, 2],
          ],
          threshold: -0.2222131937742233,
          right_val: 0.0100644398480654,
          left_val: -0.8989276885986328,
        },
        {
          features: [
            [4, 5, 2, 6, -1],
            [5, 5, 1, 6, 2],
          ],
          threshold: 0.0012954319827258587,
          right_val: 0.0905886217951775,
          left_val: -0.1016175970435143,
        },
        {
          features: [
            [1, 7, 6, 11, -1],
            [3, 7, 2, 11, 3],
          ],
          threshold: 0.0137946698814631,
          right_val: 0.1431425958871841,
          left_val: -0.0742446482181549,
        },
        {
          features: [
            [2, 15, 2, 1, -1],
            [3, 15, 1, 1, 2],
          ],
          threshold: 0.0008564380113966763,
          right_val: -0.1866019070148468,
          left_val: 0.0597539693117142,
        },
        {
          features: [
            [5, 11, 2, 6, -1],
            [5, 14, 2, 3, 2],
          ],
          threshold: -0.0233175400644541,
          right_val: 0.0136673199012876,
          left_val: -0.6925991773605347,
        },
        {
          features: [
            [6, 17, 2, 3, -1],
            [6, 18, 2, 1, 3],
          ],
          threshold: 0.001628168043680489,
          right_val: 0.1550529003143311,
          left_val: -0.0610607489943504,
        },
        {
          features: [
            [5, 8, 11, 12, -1],
            [5, 12, 11, 4, 3],
          ],
          threshold: -0.0123803298920393,
          right_val: 0.0617676004767418,
          left_val: -0.151468500494957,
        },
        {
          features: [
            [16, 10, 2, 2, -1],
            [16, 10, 1, 1, 2],
            [17, 11, 1, 1, 2],
          ],
          threshold: 0.0018393599893897772,
          right_val: 0.2482217997312546,
          left_val: -0.037167988717556,
        },
        {
          features: [
            [15, 11, 3, 1, -1],
            [16, 11, 1, 1, 3],
          ],
          threshold: 0.0035529870074242353,
          right_val: 0.33592289686203,
          left_val: -0.0292007904499769,
        },
        {
          features: [
            [13, 14, 1, 3, -1],
            [13, 15, 1, 1, 3],
          ],
          threshold: 0.0010305979521945119,
          right_val: -0.2908569872379303,
          left_val: 0.0376940816640854,
        },
        {
          features: [
            [6, 14, 3, 4, -1],
            [6, 16, 3, 2, 2],
          ],
          threshold: 0.000029916960556874983,
          right_val: 0.1051521003246307,
          left_val: -0.0880141928792,
        },
        {
          features: [
            [6, 6, 2, 14, -1],
            [6, 13, 2, 7, 2],
          ],
          threshold: -0.0004150533932261169,
          right_val: -0.1502110064029694,
          left_val: 0.0657262429594994,
        },
        {
          features: [
            [11, 14, 2, 1, -1],
            [12, 14, 1, 1, 2],
          ],
          threshold: -0.000014631619706051424,
          right_val: -0.1196243986487389,
          left_val: 0.0781703516840935,
        },
        {
          features: [
            [9, 13, 6, 6, -1],
            [9, 13, 3, 3, 2],
            [12, 16, 3, 3, 2],
          ],
          threshold: -0.004377909004688263,
          right_val: -0.0520893298089504,
          left_val: 0.2075245976448059,
        },
        {
          features: [
            [10, 17, 3, 1, -1],
            [11, 17, 1, 1, 3],
          ],
          threshold: 0.0004703619924839586,
          right_val: -0.1876772940158844,
          left_val: 0.0633484795689583,
        },
        {
          features: [
            [9, 13, 2, 6, -1],
            [9, 13, 1, 3, 2],
            [10, 16, 1, 3, 2],
          ],
          threshold: 0.000014788640328333713,
          right_val: 0.1121309995651245,
          left_val: -0.0958288535475731,
        },
        {
          features: [
            [11, 18, 4, 2, -1],
            [13, 18, 2, 2, 2],
          ],
          threshold: 0.0003704843111336231,
          right_val: 0.0986476764082909,
          left_val: -0.0987230092287064,
        },
        {
          features: [
            [9, 12, 3, 3, -1],
            [10, 12, 1, 3, 3],
          ],
          threshold: -0.0018590339459478855,
          right_val: 0.0383525788784027,
          left_val: -0.2687363028526306,
        },
        {
          features: [
            [5, 6, 1, 12, -1],
            [5, 12, 1, 6, 2],
          ],
          threshold: -0.007076452951878309,
          right_val: 0.0578413307666779,
          left_val: -0.159840002655983,
        },
        {
          features: [
            [2, 4, 6, 6, -1],
            [4, 4, 2, 6, 3],
          ],
          threshold: 0.0149200102314353,
          right_val: 0.1924290955066681,
          left_val: -0.0511781498789787,
        },
        {
          features: [
            [1, 4, 9, 3, -1],
            [4, 4, 3, 3, 3],
          ],
          threshold: -0.0050713191740214825,
          right_val: -0.1112122982740402,
          left_val: 0.138632595539093,
        },
        {
          features: [
            [5, 10, 3, 3, -1],
            [5, 11, 3, 1, 3],
          ],
          threshold: -0.0150055000558496,
          right_val: -0.0188117604702711,
          left_val: 0.485839307308197,
        },
        {
          features: [
            [8, 9, 1, 3, -1],
            [8, 10, 1, 1, 3],
          ],
          threshold: -0.0020439480431377888,
          right_val: 0.0278163105249405,
          left_val: -0.3275485932826996,
        },
        {
          features: [
            [11, 19, 6, 1, -1],
            [13, 19, 2, 1, 3],
          ],
          threshold: -0.00013060690253041685,
          right_val: -0.0849575772881508,
          left_val: 0.0988680422306061,
        },
        {
          features: [
            [18, 4, 2, 8, -1],
            [18, 4, 1, 4, 2],
            [19, 8, 1, 4, 2],
          ],
          threshold: 0.008874261751770973,
          right_val: 0.3238987922668457,
          left_val: -0.0252356007695198,
        },
        {
          features: [
            [17, 5, 2, 3, -1],
            [17, 6, 2, 1, 3],
          ],
          threshold: 0.0007039750926196575,
          right_val: -0.1739207953214645,
          left_val: 0.0563275218009949,
        },
        {
          features: [
            [12, 15, 8, 4, -1],
            [16, 15, 4, 4, 2],
          ],
          threshold: -0.025402469560504,
          right_val: -0.0473623014986515,
          left_val: 0.1967539042234421,
        },
        {
          features: [
            [14, 8, 4, 10, -1],
            [14, 13, 4, 5, 2],
          ],
          threshold: -0.009374366141855717,
          right_val: 0.0599326305091381,
          left_val: -0.1520421952009201,
        },
      ],
      threshold: -1.337285041809082,
    },
    {
      simpleClassifiers: [
        {
          features: [
            [11, 0, 3, 18, -1],
            [11, 6, 3, 6, 3],
          ],
          threshold: 0.0404530204832554,
          right_val: 0.2886553108692169,
          left_val: -0.2363782972097397,
        },
        {
          features: [
            [8, 5, 12, 6, -1],
            [8, 7, 12, 2, 3],
          ],
          threshold: -0.0110560497269034,
          right_val: -0.2625974118709564,
          left_val: 0.160629004240036,
        },
        {
          features: [
            [10, 11, 4, 2, -1],
            [12, 11, 2, 2, 2],
          ],
          threshold: -0.00039778949576430023,
          right_val: -0.2708101868629456,
          left_val: 0.1159109994769096,
        },
        {
          features: [
            [5, 7, 2, 8, -1],
            [6, 7, 1, 8, 2],
          ],
          threshold: 0.001019153045490384,
          right_val: 0.1364289969205856,
          left_val: -0.2096937000751495,
        },
        {
          features: [
            [6, 3, 12, 12, -1],
            [6, 3, 6, 6, 2],
            [12, 9, 6, 6, 2],
          ],
          threshold: 0.0036101979203522205,
          right_val: 0.1261779069900513,
          left_val: -0.2172545939683914,
        },
        {
          features: [
            [6, 10, 4, 2, -1],
            [6, 10, 2, 1, 2],
            [8, 11, 2, 1, 2],
          ],
          threshold: 0.00044545531272888184,
          right_val: 0.1259648948907852,
          left_val: -0.1597453951835632,
        },
        {
          features: [
            [0, 2, 6, 10, -1],
            [2, 2, 2, 10, 3],
          ],
          threshold: 0.005822622217237949,
          right_val: 0.0977838113903999,
          left_val: -0.1548444926738739,
        },
        {
          features: [
            [10, 15, 3, 2, -1],
            [11, 15, 1, 2, 3],
          ],
          threshold: -0.0021416260860860348,
          right_val: 0.0401033498346806,
          left_val: -0.3637767136096954,
        },
        {
          features: [
            [6, 8, 10, 2, -1],
            [6, 8, 5, 1, 2],
            [11, 9, 5, 1, 2],
          ],
          threshold: -0.0002669162058737129,
          right_val: -0.1749610006809235,
          left_val: 0.0844707563519478,
        },
        {
          features: [
            [6, 12, 1, 6, -1],
            [6, 15, 1, 3, 2],
          ],
          threshold: -0.005435233004391193,
          right_val: 0.0497860386967659,
          left_val: -0.3183093070983887,
        },
        {
          features: [
            [9, 0, 4, 1, -1],
            [11, 0, 2, 1, 2],
          ],
          threshold: -0.001542630954645574,
          right_val: 0.0648845136165619,
          left_val: -0.2133370935916901,
        },
        {
          features: [
            [8, 5, 2, 3, -1],
            [8, 6, 2, 1, 3],
          ],
          threshold: -0.002793228952214122,
          right_val: -0.0651709288358688,
          left_val: 0.2548325061798096,
        },
        {
          features: [
            [7, 4, 2, 1, -1],
            [8, 4, 1, 1, 2],
          ],
          threshold: 0.0013845940120518208,
          right_val: -0.3740482926368713,
          left_val: 0.039304580539465,
        },
        {
          features: [
            [2, 11, 3, 1, -1],
            [3, 11, 1, 1, 3],
          ],
          threshold: -0.0032193479128181934,
          right_val: -0.0563963614404202,
          left_val: 0.2629042863845825,
        },
        {
          features: [
            [1, 10, 3, 3, -1],
            [2, 10, 1, 3, 3],
          ],
          threshold: -0.009797735139727592,
          right_val: -0.0463822893798351,
          left_val: 0.3204438984394074,
        },
        {
          features: [
            [12, 0, 8, 2, -1],
            [12, 0, 4, 1, 2],
            [16, 1, 4, 1, 2],
          ],
          threshold: -0.0017625789623707533,
          right_val: -0.088892437517643,
          left_val: 0.1505081951618195,
        },
        {
          features: [
            [6, 6, 6, 8, -1],
            [9, 6, 3, 8, 2],
          ],
          threshold: -0.0360968895256519,
          right_val: 0.0317858010530472,
          left_val: -0.4313783943653107,
        },
        {
          features: [
            [6, 10, 1, 3, -1],
            [6, 11, 1, 1, 3],
          ],
          threshold: 0.0020813369192183018,
          right_val: 0.1927528977394104,
          left_val: -0.0659579187631607,
        },
        {
          features: [
            [8, 12, 7, 2, -1],
            [8, 13, 7, 1, 2],
          ],
          threshold: -0.006053369026631117,
          right_val: 0.0510074310004711,
          left_val: -0.3137460947036743,
        },
        {
          features: [
            [6, 11, 2, 3, -1],
            [6, 12, 2, 1, 3],
          ],
          threshold: 0.0037253410555422306,
          right_val: 0.2563137114048004,
          left_val: -0.0614025890827179,
        },
        {
          features: [
            [6, 6, 2, 12, -1],
            [6, 12, 2, 6, 2],
          ],
          threshold: 0.00506682600826025,
          right_val: -0.2434016019105911,
          left_val: 0.0579627305269241,
        },
        {
          features: [
            [6, 12, 2, 3, -1],
            [6, 13, 2, 1, 3],
          ],
          threshold: 0.0028038739692419767,
          right_val: 0.2137586027383804,
          left_val: -0.0703297033905983,
        },
        {
          features: [
            [12, 12, 1, 3, -1],
            [12, 13, 1, 1, 3],
          ],
          threshold: 0.0015925259795039892,
          right_val: -0.5112913846969604,
          left_val: 0.0266377609223127,
        },
        {
          features: [
            [8, 9, 1, 2, -1],
            [8, 10, 1, 1, 2],
          ],
          threshold: 0.000029422679290291853,
          right_val: 0.0649850517511368,
          left_val: -0.2171020060777664,
        },
        {
          features: [
            [7, 11, 4, 6, -1],
            [7, 11, 2, 3, 2],
            [9, 14, 2, 3, 2],
          ],
          threshold: -0.000022399190129362978,
          right_val: -0.1513561010360718,
          left_val: 0.0815825685858727,
        },
        {
          features: [
            [10, 10, 4, 3, -1],
            [10, 11, 4, 1, 3],
          ],
          threshold: 0.0006707282736897469,
          right_val: -0.1178736016154289,
          left_val: 0.1050219014286995,
        },
        {
          features: [
            [12, 10, 2, 3, -1],
            [12, 11, 2, 1, 3],
          ],
          threshold: -0.00152623001486063,
          right_val: 0.0392440892755985,
          left_val: -0.3462037146091461,
        },
        {
          features: [
            [6, 13, 2, 3, -1],
            [6, 14, 2, 1, 3],
          ],
          threshold: 0.0018151829717680812,
          right_val: 0.1684775948524475,
          left_val: -0.0746694579720497,
        },
        {
          features: [
            [7, 14, 1, 3, -1],
            [7, 15, 1, 1, 3],
          ],
          threshold: 0.0005807877168990672,
          right_val: 0.141927495598793,
          left_val: -0.0979524105787277,
        },
        {
          features: [
            [6, 10, 8, 6, -1],
            [6, 12, 8, 2, 3],
          ],
          threshold: -0.008962331339716911,
          right_val: 0.0662680417299271,
          left_val: -0.1960162073373795,
        },
        {
          features: [
            [5, 8, 6, 12, -1],
            [5, 12, 6, 4, 3],
          ],
          threshold: 0.1114680990576744,
          right_val: -0.649177074432373,
          left_val: 0.0170001406222582,
        },
        {
          features: [
            [1, 14, 2, 1, -1],
            [2, 14, 1, 1, 2],
          ],
          threshold: -0.00017872039461508393,
          right_val: 0.0801087021827698,
          left_val: -0.1405359953641892,
        },
        {
          features: [
            [8, 6, 2, 3, -1],
            [8, 7, 2, 1, 3],
          ],
          threshold: -0.004658776801079512,
          right_val: -0.0586023405194283,
          left_val: 0.1953022927045822,
        },
        {
          features: [
            [4, 6, 8, 4, -1],
            [4, 6, 4, 2, 2],
            [8, 8, 4, 2, 2],
          ],
          threshold: 0.0034576000180095434,
          right_val: -0.2199078947305679,
          left_val: 0.0598057992756367,
        },
        {
          features: [
            [0, 14, 3, 1, -1],
            [1, 14, 1, 1, 3],
          ],
          threshold: -0.00019979270291514695,
          right_val: 0.0834302306175232,
          left_val: -0.1372614949941635,
        },
        {
          features: [
            [4, 1, 2, 2, -1],
            [4, 1, 1, 1, 2],
            [5, 2, 1, 1, 2],
          ],
          threshold: -0.004807975143194199,
          right_val: -0.0207152999937534,
          left_val: 0.5504192113876343,
        },
        {
          features: [
            [14, 10, 1, 6, -1],
            [14, 13, 1, 3, 2],
          ],
          threshold: -0.00000733892920834478,
          right_val: -0.1448659002780914,
          left_val: 0.0753020271658897,
        },
        {
          features: [
            [5, 10, 1, 3, -1],
            [5, 11, 1, 1, 3],
          ],
          threshold: -0.003579979995265603,
          right_val: -0.0425504595041275,
          left_val: 0.2627722024917603,
        },
        {
          features: [
            [5, 10, 3, 3, -1],
            [5, 11, 3, 1, 3],
          ],
          threshold: 0.001168985036201775,
          right_val: 0.1297184973955154,
          left_val: -0.1098416969180107,
        },
        {
          features: [
            [2, 3, 12, 4, -1],
            [2, 3, 6, 2, 2],
            [8, 5, 6, 2, 2],
          ],
          threshold: 0.0326395481824875,
          right_val: -0.3947426080703735,
          left_val: 0.0310383792966604,
        },
        {
          features: [
            [10, 15, 3, 2, -1],
            [11, 15, 1, 2, 3],
          ],
          threshold: 0.0011596709955483675,
          right_val: -0.2203582972288132,
          left_val: 0.052021898329258,
        },
        {
          features: [
            [12, 14, 8, 1, -1],
            [16, 14, 4, 1, 2],
          ],
          threshold: -0.0014262240147218108,
          right_val: -0.100670799612999,
          left_val: 0.1074569970369339,
        },
        {
          features: [
            [11, 0, 8, 13, -1],
            [15, 0, 4, 13, 2],
          ],
          threshold: -0.2366832941770554,
          right_val: 0.0169996097683907,
          left_val: -0.7317435145378113,
        },
        {
          features: [
            [12, 12, 2, 8, -1],
            [12, 12, 1, 4, 2],
            [13, 16, 1, 4, 2],
          ],
          threshold: 0.00019279429398011416,
          right_val: 0.0781860277056694,
          left_val: -0.1324844062328339,
        },
        {
          features: [
            [4, 7, 8, 12, -1],
            [4, 13, 8, 6, 2],
          ],
          threshold: -0.0172921493649483,
          right_val: 0.1106956005096436,
          left_val: -0.0971998423337936,
        },
        {
          features: [
            [10, 9, 2, 4, -1],
            [10, 11, 2, 2, 2],
          ],
          threshold: -0.0012431619688868523,
          right_val: -0.0725483372807503,
          left_val: 0.1774147003889084,
        },
        {
          features: [
            [4, 4, 3, 1, -1],
            [5, 4, 1, 1, 3],
          ],
          threshold: 0.000021754560293629766,
          right_val: 0.1089940965175629,
          left_val: -0.0969520509243011,
        },
        {
          features: [
            [18, 5, 1, 3, -1],
            [18, 6, 1, 1, 3],
          ],
          threshold: 0.0003097587905358523,
          right_val: -0.1738471984863281,
          left_val: 0.0622498914599419,
        },
        {
          features: [
            [6, 9, 9, 1, -1],
            [9, 9, 3, 1, 3],
          ],
          threshold: -0.0115905702114105,
          right_val: -0.0419940799474716,
          left_val: 0.2616280913352966,
        },
        {
          features: [
            [12, 5, 4, 6, -1],
            [12, 7, 4, 2, 3],
          ],
          threshold: 0.0181509200483561,
          right_val: -0.4468541145324707,
          left_val: 0.0263535492122173,
        },
        {
          features: [
            [16, 0, 4, 4, -1],
            [18, 0, 2, 4, 2],
          ],
          threshold: 0.0008022350957617164,
          right_val: 0.087092787027359,
          left_val: -0.1214386969804764,
        },
        {
          features: [
            [3, 10, 2, 2, -1],
            [3, 10, 1, 1, 2],
            [4, 11, 1, 1, 2],
          ],
          threshold: -0.0014258639421314,
          right_val: -0.0529874302446842,
          left_val: 0.1923608034849167,
        },
        {
          features: [
            [0, 0, 2, 1, -1],
            [1, 0, 1, 1, 2],
          ],
          threshold: -0.0002453626075293869,
          right_val: 0.0656048208475113,
          left_val: -0.1668370068073273,
        },
        {
          features: [
            [17, 4, 2, 8, -1],
            [17, 4, 1, 4, 2],
            [18, 8, 1, 4, 2],
          ],
          threshold: 0.00002205002965638414,
          right_val: 0.10711719840765,
          left_val: -0.0934774726629257,
        },
        {
          features: [
            [7, 15, 1, 3, -1],
            [7, 16, 1, 1, 3],
          ],
          threshold: 0.0004765886114910245,
          right_val: 0.1251268982887268,
          left_val: -0.0805966332554817,
        },
        {
          features: [
            [0, 15, 2, 1, -1],
            [1, 15, 1, 1, 2],
          ],
          threshold: 0.00040533850551582873,
          right_val: -0.1574075967073441,
          left_val: 0.0689906179904938,
        },
        {
          features: [
            [7, 10, 2, 4, -1],
            [7, 12, 2, 2, 2],
          ],
          threshold: -0.0164717491716146,
          right_val: 0.0188761092722416,
          left_val: -0.596678614616394,
        },
        {
          features: [
            [4, 19, 3, 1, -1],
            [5, 19, 1, 1, 3],
          ],
          threshold: 0.0022267159074544907,
          right_val: 0.2307108938694,
          left_val: -0.0458038300275803,
        },
        {
          features: [
            [2, 14, 4, 5, -1],
            [4, 14, 2, 5, 2],
          ],
          threshold: 0.0493831895291805,
          right_val: -0.593061089515686,
          left_val: 0.0198377296328545,
        },
        {
          features: [
            [4, 11, 4, 4, -1],
            [4, 11, 2, 2, 2],
            [6, 13, 2, 2, 2],
          ],
          threshold: 0.00864114984869957,
          right_val: -0.3516111969947815,
          left_val: 0.028697369620204,
        },
        {
          features: [
            [4, 13, 2, 6, -1],
            [4, 13, 1, 3, 2],
            [5, 16, 1, 3, 2],
          ],
          threshold: -0.004824139177799225,
          right_val: -0.0484632104635239,
          left_val: 0.2247433960437775,
        },
        {
          features: [
            [7, 3, 3, 4, -1],
            [8, 3, 1, 4, 3],
          ],
          threshold: -0.00861748494207859,
          right_val: 0.0191831905394793,
          left_val: -0.5708895921707153,
        },
        {
          features: [
            [17, 11, 3, 2, -1],
            [18, 11, 1, 2, 3],
          ],
          threshold: -0.0005722069763578475,
          right_val: -0.0889380574226379,
          left_val: 0.1169726997613907,
        },
        {
          features: [
            [10, 4, 6, 2, -1],
            [10, 5, 6, 1, 2],
          ],
          threshold: 0.001199773047119379,
          right_val: -0.1256549954414368,
          left_val: 0.084181122481823,
        },
        {
          features: [
            [12, 3, 6, 3, -1],
            [12, 4, 6, 1, 3],
          ],
          threshold: 0.002604990964755416,
          right_val: -0.2063814997673035,
          left_val: 0.0595000311732292,
        },
        {
          features: [
            [17, 12, 2, 2, -1],
            [17, 12, 1, 1, 2],
            [18, 13, 1, 1, 2],
          ],
          threshold: -0.0014789920533075929,
          right_val: -0.0475350506603718,
          left_val: 0.2511498034000397,
        },
        {
          features: [
            [5, 12, 15, 8, -1],
            [10, 12, 5, 8, 3],
          ],
          threshold: -0.2574672102928162,
          right_val: 0.0154406800866127,
          left_val: -0.7303876876831055,
        },
        {
          features: [
            [4, 18, 2, 2, -1],
            [4, 18, 1, 1, 2],
            [5, 19, 1, 1, 2],
          ],
          threshold: -0.0012104290071874857,
          right_val: -0.0557898096740246,
          left_val: 0.186469703912735,
        },
        {
          features: [
            [0, 15, 2, 2, -1],
            [0, 15, 1, 1, 2],
            [1, 16, 1, 1, 2],
          ],
          threshold: 0.00034140399657189846,
          right_val: -0.1559716016054153,
          left_val: 0.0677076727151871,
        },
        {
          features: [
            [5, 9, 1, 6, -1],
            [5, 12, 1, 3, 2],
          ],
          threshold: 0.0031749058980494738,
          right_val: -0.2952930927276611,
          left_val: 0.0350034609436989,
        },
        {
          features: [
            [1, 0, 18, 14, -1],
            [1, 7, 18, 7, 2],
          ],
          threshold: 0.4433881938457489,
          right_val: -0.6103466153144836,
          left_val: 0.0145500199869275,
        },
        {
          features: [
            [6, 2, 7, 6, -1],
            [6, 5, 7, 3, 2],
          ],
          threshold: 0.0394582599401474,
          right_val: 0.2292751967906952,
          left_val: -0.0457793287932873,
        },
        {
          features: [
            [6, 16, 2, 1, -1],
            [7, 16, 1, 1, 2],
          ],
          threshold: 0.0030410829931497574,
          right_val: -0.5749111771583557,
          left_val: 0.0163041297346354,
        },
        {
          features: [
            [4, 11, 16, 9, -1],
            [4, 14, 16, 3, 3],
          ],
          threshold: -0.1485302001237869,
          right_val: 0.0157710500061512,
          left_val: -0.5622090101242065,
        },
        {
          features: [
            [16, 9, 2, 2, -1],
            [17, 9, 1, 2, 2],
          ],
          threshold: 0.00004433900903677568,
          right_val: 0.1092097982764244,
          left_val: -0.0912843719124794,
        },
        {
          features: [
            [6, 8, 2, 2, -1],
            [7, 8, 1, 2, 2],
          ],
          threshold: 0.0022139810025691986,
          right_val: 0.2229178994894028,
          left_val: -0.0476682893931866,
        },
        {
          features: [
            [0, 14, 12, 3, -1],
            [6, 14, 6, 3, 2],
          ],
          threshold: 0.0878319665789604,
          right_val: -0.4039632976055145,
          left_val: 0.0267180595546961,
        },
        {
          features: [
            [7, 6, 3, 10, -1],
            [7, 11, 3, 5, 2],
          ],
          threshold: -0.0022798930294811726,
          right_val: 0.0660711079835892,
          left_val: -0.1616093069314957,
        },
        {
          features: [
            [10, 11, 1, 2, -1],
            [10, 12, 1, 1, 2],
          ],
          threshold: -0.000014653969628852792,
          right_val: -0.1272401958703995,
          left_val: 0.0852983593940735,
        },
        {
          features: [
            [5, 17, 2, 2, -1],
            [6, 17, 1, 2, 2],
          ],
          threshold: 0.0012313240440562367,
          right_val: 0.1660642027854919,
          left_val: -0.0659174770116806,
        },
        {
          features: [
            [2, 0, 18, 18, -1],
            [11, 0, 9, 18, 2],
          ],
          threshold: 0.4511098861694336,
          right_val: -0.7152550220489502,
          left_val: 0.0134579604491591,
        },
        {
          features: [
            [12, 11, 6, 3, -1],
            [14, 11, 2, 3, 3],
          ],
          threshold: -0.0245186407119036,
          right_val: 0.020400719717145,
          left_val: -0.4328263998031616,
        },
        {
          features: [
            [12, 12, 6, 1, -1],
            [14, 12, 2, 1, 3],
          ],
          threshold: -0.00011901959805982187,
          right_val: -0.1183476001024246,
          left_val: 0.0894203335046768,
        },
        {
          features: [
            [15, 10, 2, 2, -1],
            [15, 10, 1, 1, 2],
            [16, 11, 1, 1, 2],
          ],
          threshold: -0.00135849101934582,
          right_val: -0.0439074002206326,
          left_val: 0.247222900390625,
        },
        {
          features: [
            [3, 11, 3, 8, -1],
            [4, 11, 1, 8, 3],
          ],
          threshold: 0.006928972899913788,
          right_val: 0.1666574031114578,
          left_val: -0.0568326190114021,
        },
        {
          features: [
            [6, 1, 4, 12, -1],
            [8, 1, 2, 12, 2],
          ],
          threshold: -0.006904184818267822,
          right_val: 0.0793106034398079,
          left_val: -0.1274220943450928,
        },
        {
          features: [
            [6, 3, 4, 8, -1],
            [8, 3, 2, 8, 2],
          ],
          threshold: 0.0012964820489287376,
          right_val: -0.1686387062072754,
          left_val: 0.0724624395370483,
        },
        {
          features: [
            [8, 4, 6, 12, -1],
            [11, 4, 3, 12, 2],
          ],
          threshold: 0.0230600591748953,
          right_val: 0.2166478931903839,
          left_val: -0.050913080573082,
        },
        {
          features: [
            [16, 12, 4, 5, -1],
            [18, 12, 2, 5, 2],
          ],
          threshold: -0.040960568934679,
          right_val: 0.0196095500141382,
          left_val: -0.5647913813591003,
        },
        {
          features: [
            [14, 9, 2, 3, -1],
            [15, 9, 1, 3, 2],
          ],
          threshold: 0.00007486747927032411,
          right_val: 0.1461513936519623,
          left_val: -0.0694503337144852,
        },
        {
          features: [
            [9, 7, 10, 6, -1],
            [14, 7, 5, 6, 2],
          ],
          threshold: -0.006845827214419842,
          right_val: -0.2084072977304459,
          left_val: 0.0660499781370163,
        },
        {
          features: [
            [12, 7, 3, 11, -1],
            [13, 7, 1, 11, 3],
          ],
          threshold: 0.019395649433136,
          right_val: -0.5639616250991821,
          left_val: 0.016168899834156,
        },
        {
          features: [
            [19, 16, 1, 2, -1],
            [19, 17, 1, 1, 2],
          ],
          threshold: -0.00016121419321279973,
          right_val: 0.0740941166877747,
          left_val: -0.1319456994533539,
        },
        {
          features: [
            [8, 15, 12, 1, -1],
            [14, 15, 6, 1, 2],
          ],
          threshold: 0.006651169154793024,
          right_val: 0.1989438980817795,
          left_val: -0.0552618205547333,
        },
        {
          features: [
            [10, 15, 6, 3, -1],
            [10, 16, 6, 1, 3],
          ],
          threshold: 0.004517217166721821,
          right_val: -0.3098089098930359,
          left_val: 0.032863661646843,
        },
        {
          features: [
            [6, 8, 10, 4, -1],
            [6, 8, 5, 2, 2],
            [11, 10, 5, 2, 2],
          ],
          threshold: -0.0402470417320728,
          right_val: 0.0124387396499515,
          left_val: -0.6898034811019897,
        },
        {
          features: [
            [10, 15, 1, 3, -1],
            [10, 16, 1, 1, 3],
          ],
          threshold: 0.000007254403044498758,
          right_val: 0.097919799387455,
          left_val: -0.0959498733282089,
        },
        {
          features: [
            [10, 1, 9, 12, -1],
            [10, 7, 9, 6, 2],
          ],
          threshold: -0.1602565050125122,
          right_val: -0.0186434295028448,
          left_val: 0.4947263896465302,
        },
        {
          features: [
            [10, 1, 1, 4, -1],
            [10, 3, 1, 2, 2],
          ],
          threshold: 0.0005059890099801123,
          right_val: 0.0866990983486176,
          left_val: -0.1221657991409302,
        },
        {
          features: [
            [1, 5, 18, 4, -1],
            [1, 7, 18, 2, 2],
          ],
          threshold: -0.1050689965486527,
          right_val: 0.008287038654088974,
          left_val: -0.8585562705993652,
        },
        {
          features: [
            [6, 4, 12, 6, -1],
            [12, 4, 6, 6, 2],
          ],
          threshold: -0.1821838021278381,
          right_val: 0.0131606003269553,
          left_val: -0.5847731232643127,
        },
        {
          features: [
            [13, 1, 7, 3, -1],
            [13, 2, 7, 1, 3],
          ],
          threshold: 0.0164354108273983,
          right_val: -0.5513756275177002,
          left_val: 0.0162963606417179,
        },
        {
          features: [
            [14, 0, 6, 4, -1],
            [14, 0, 3, 2, 2],
            [17, 2, 3, 2, 2],
          ],
          threshold: 0.0192825198173523,
          right_val: 0.4364516139030457,
          left_val: -0.0250274799764156,
        },
        {
          features: [
            [9, 12, 3, 3, -1],
            [9, 13, 3, 1, 3],
          ],
          threshold: 0.0034772949293255806,
          right_val: -0.2924675941467285,
          left_val: 0.0316327810287476,
        },
        {
          features: [
            [5, 14, 8, 4, -1],
            [5, 14, 4, 2, 2],
            [9, 16, 4, 2, 2],
          ],
          threshold: 0.0226208698004484,
          right_val: 0.4310530126094818,
          left_val: -0.0239857397973537,
        },
        {
          features: [
            [1, 6, 14, 14, -1],
            [8, 6, 7, 14, 2],
          ],
          threshold: -0.1817232072353363,
          right_val: 0.0519034899771214,
          left_val: -0.1803786009550095,
        },
        {
          features: [
            [13, 4, 6, 2, -1],
            [13, 4, 3, 1, 2],
            [16, 5, 3, 1, 2],
          ],
          threshold: -0.004381983075290918,
          right_val: 0.033024039119482,
          left_val: -0.2830285131931305,
        },
        {
          features: [
            [8, 7, 6, 6, -1],
            [8, 9, 6, 2, 3],
          ],
          threshold: -0.0152461202815175,
          right_val: -0.0412422493100166,
          left_val: 0.2351991981267929,
        },
        {
          features: [
            [8, 0, 12, 20, -1],
            [8, 10, 12, 10, 2],
          ],
          threshold: 0.3904328942298889,
          right_val: -0.3584577143192291,
          left_val: 0.0285306293517351,
        },
        {
          features: [
            [9, 8, 4, 3, -1],
            [9, 9, 4, 1, 3],
          ],
          threshold: 0.003910345025360584,
          right_val: 0.1782976984977722,
          left_val: -0.0515237487852573,
        },
        {
          features: [
            [10, 18, 8, 2, -1],
            [10, 19, 8, 1, 2],
          ],
          threshold: -0.0108475601300597,
          right_val: 0.0187657903879881,
          left_val: -0.4835528135299683,
        },
        {
          features: [
            [9, 12, 4, 2, -1],
            [9, 12, 2, 1, 2],
            [11, 13, 2, 1, 2],
          ],
          threshold: 0.005701533984392881,
          right_val: -0.7045748829841614,
          left_val: 0.0122508304193616,
        },
        {
          features: [
            [4, 14, 2, 2, -1],
            [4, 14, 1, 1, 2],
            [5, 15, 1, 1, 2],
          ],
          threshold: -0.0011917110532522202,
          right_val: -0.0501446202397347,
          left_val: 0.1840443015098572,
        },
        {
          features: [
            [5, 14, 3, 2, -1],
            [5, 15, 3, 1, 2],
          ],
          threshold: 0.00040988530963659286,
          right_val: 0.1087457984685898,
          left_val: -0.0973996669054031,
        },
        {
          features: [
            [11, 1, 6, 3, -1],
            [13, 1, 2, 3, 3],
          ],
          threshold: 0.004529548808932304,
          right_val: -0.2106914073228836,
          left_val: 0.0453568398952484,
        },
        {
          features: [
            [6, 14, 2, 3, -1],
            [6, 15, 2, 1, 3],
          ],
          threshold: -0.005489373113960028,
          right_val: -0.0358708314597607,
          left_val: 0.2964279055595398,
        },
        {
          features: [
            [14, 1, 2, 2, -1],
            [15, 1, 1, 2, 2],
          ],
          threshold: 0.0019906361121684313,
          right_val: -0.3150646984577179,
          left_val: 0.0343328714370728,
        },
        {
          features: [
            [0, 13, 6, 7, -1],
            [3, 13, 3, 7, 2],
          ],
          threshold: 0.0833584666252136,
          right_val: -0.4427998065948486,
          left_val: 0.0196845196187496,
        },
        {
          features: [
            [17, 11, 3, 1, -1],
            [18, 11, 1, 1, 3],
          ],
          threshold: 0.0030363420955836773,
          right_val: 0.2666968107223511,
          left_val: -0.0336938314139843,
        },
        {
          features: [
            [5, 10, 8, 4, -1],
            [9, 10, 4, 4, 2],
          ],
          threshold: 0.057799968868494,
          right_val: -0.9896581768989563,
          left_val: 0.008587588556110859,
        },
        {
          features: [
            [7, 16, 8, 4, -1],
            [7, 16, 4, 2, 2],
            [11, 18, 4, 2, 2],
          ],
          threshold: -0.007858564145863056,
          right_val: -0.046583641320467,
          left_val: 0.2008845955133438,
        },
        {
          features: [
            [11, 16, 4, 3, -1],
            [11, 17, 4, 1, 3],
          ],
          threshold: 0.0019253200152888894,
          right_val: -0.2264011055231094,
          left_val: 0.0479223690927029,
        },
        {
          features: [
            [3, 10, 6, 2, -1],
            [3, 10, 3, 1, 2],
            [6, 11, 3, 1, 2],
          ],
          threshold: 0.0109969098120928,
          right_val: -0.540481686592102,
          left_val: 0.0162586607038975,
        },
        {
          features: [
            [11, 7, 3, 2, -1],
            [12, 7, 1, 2, 3],
          ],
          threshold: 0.00016405170026700944,
          right_val: 0.076001413166523,
          left_val: -0.1154251024127007,
        },
        {
          features: [
            [8, 7, 9, 2, -1],
            [11, 7, 3, 2, 3],
          ],
          threshold: 0.00537803815677762,
          right_val: -0.0841798484325409,
          left_val: 0.1117902994155884,
        },
        {
          features: [
            [13, 6, 3, 10, -1],
            [14, 6, 1, 10, 3],
          ],
          threshold: 0.0022905960213392973,
          right_val: 0.1689942926168442,
          left_val: -0.0579694807529449,
        },
        {
          features: [
            [15, 10, 4, 3, -1],
            [17, 10, 2, 3, 2],
          ],
          threshold: 0.006310258060693741,
          right_val: -0.204782098531723,
          left_val: 0.0414713993668556,
        },
        {
          features: [
            [1, 10, 6, 10, -1],
            [3, 10, 2, 10, 3],
          ],
          threshold: -0.1434257030487061,
          right_val: 0.0116343097761273,
          left_val: -0.7857347726821899,
        },
        {
          features: [
            [5, 0, 2, 2, -1],
            [5, 0, 1, 1, 2],
            [6, 1, 1, 1, 2],
          ],
          threshold: 0.0012364640133455396,
          right_val: 0.1773435026407242,
          left_val: -0.0518007315695286,
        },
        {
          features: [
            [3, 11, 3, 6, -1],
            [3, 13, 3, 2, 3],
          ],
          threshold: -0.0200465507805347,
          right_val: 0.0288490708917379,
          left_val: -0.3142091035842896,
        },
        {
          features: [
            [4, 6, 9, 10, -1],
            [7, 6, 3, 10, 3],
          ],
          threshold: 0.1086810976266861,
          right_val: -0.5195630788803101,
          left_val: 0.0161835309118032,
        },
        {
          features: [
            [6, 10, 9, 5, -1],
            [9, 10, 3, 5, 3],
          ],
          threshold: 0.0511734895408154,
          right_val: 0.3123018145561218,
          left_val: -0.0324603095650673,
        },
        {
          features: [
            [10, 5, 3, 9, -1],
            [11, 5, 1, 9, 3],
          ],
          threshold: 0.013251069933176,
          right_val: -0.4421024918556213,
          left_val: 0.0236550606787205,
        },
        {
          features: [
            [3, 7, 3, 4, -1],
            [4, 7, 1, 4, 3],
          ],
          threshold: -0.002011096104979515,
          right_val: -0.0939614623785019,
          left_val: 0.103593997657299,
        },
        {
          features: [
            [4, 6, 2, 2, -1],
            [4, 6, 1, 1, 2],
            [5, 7, 1, 1, 2],
          ],
          threshold: -0.003284305101260543,
          right_val: -0.0299212802201509,
          left_val: 0.331969290971756,
        },
        {
          features: [
            [0, 2, 2, 3, -1],
            [0, 3, 2, 1, 3],
          ],
          threshold: 0.0008834123727865517,
          right_val: -0.1619275063276291,
          left_val: 0.0598918199539185,
        },
        {
          features: [
            [12, 0, 8, 4, -1],
            [12, 0, 4, 2, 2],
            [16, 2, 4, 2, 2],
          ],
          threshold: 0.008426599204540253,
          right_val: 0.2369119971990585,
          left_val: -0.0369287505745888,
        },
        {
          features: [
            [11, 1, 8, 2, -1],
            [11, 1, 4, 1, 2],
            [15, 2, 4, 1, 2],
          ],
          threshold: -0.000014503750207950361,
          right_val: -0.1329060941934586,
          left_val: 0.0773738473653793,
        },
        {
          features: [
            [12, 2, 7, 3, -1],
            [12, 3, 7, 1, 3],
          ],
          threshold: 0.008089168928563595,
          right_val: -0.3096123039722443,
          left_val: 0.0288175698369741,
        },
        {
          features: [
            [3, 6, 3, 2, -1],
            [4, 6, 1, 2, 3],
          ],
          threshold: 0.0103399399667978,
          right_val: 0.3706004917621613,
          left_val: -0.024850569665432,
        },
        {
          features: [
            [4, 6, 4, 6, -1],
            [4, 9, 4, 3, 2],
          ],
          threshold: -0.002279053907841444,
          right_val: 0.0418775305151939,
          left_val: -0.2205137014389038,
        },
        {
          features: [
            [13, 12, 6, 4, -1],
            [13, 12, 3, 2, 2],
            [16, 14, 3, 2, 2],
          ],
          threshold: -0.0017716860165819526,
          right_val: -0.0652523636817932,
          left_val: 0.1420508027076721,
        },
        {
          features: [
            [13, 10, 2, 4, -1],
            [13, 12, 2, 2, 2],
          ],
          threshold: -0.006931720767170191,
          right_val: 0.0276059694588184,
          left_val: -0.3355607986450195,
        },
        {
          features: [
            [15, 12, 3, 3, -1],
            [15, 13, 3, 1, 3],
          ],
          threshold: -0.004250606056302786,
          right_val: -0.0373453199863434,
          left_val: 0.2359198033809662,
        },
        {
          features: [
            [14, 14, 2, 3, -1],
            [14, 15, 2, 1, 3],
          ],
          threshold: 0.001531759975478053,
          right_val: -0.2343820035457611,
          left_val: 0.0396570116281509,
        },
        {
          features: [
            [18, 4, 2, 8, -1],
            [18, 4, 1, 4, 2],
            [19, 8, 1, 4, 2],
          ],
          threshold: 0.0014941049739718437,
          right_val: 0.1446844041347504,
          left_val: -0.0603119991719723,
        },
        {
          features: [
            [7, 14, 2, 4, -1],
            [7, 14, 1, 2, 2],
            [8, 16, 1, 2, 2],
          ],
          threshold: -0.005224986933171749,
          right_val: 0.0232572704553604,
          left_val: -0.4066025018692017,
        },
        {
          features: [
            [14, 3, 6, 6, -1],
            [14, 5, 6, 2, 3],
          ],
          threshold: 0.0006475953268818557,
          right_val: -0.1298730969429016,
          left_val: 0.0648282393813133,
        },
        {
          features: [
            [19, 7, 1, 2, -1],
            [19, 8, 1, 1, 2],
          ],
          threshold: 0.0003283612022642046,
          right_val: -0.1483581066131592,
          left_val: 0.0619176290929317,
        },
        {
          features: [
            [8, 8, 6, 2, -1],
            [8, 8, 3, 1, 2],
            [11, 9, 3, 1, 2],
          ],
          threshold: -0.003469127928838134,
          right_val: -0.0572003498673439,
          left_val: 0.1566284000873566,
        },
        {
          features: [
            [19, 6, 1, 3, -1],
            [19, 7, 1, 1, 3],
          ],
          threshold: 0.0004590337921399623,
          right_val: -0.1909317970275879,
          left_val: 0.0525178983807564,
        },
        {
          features: [
            [7, 8, 7, 3, -1],
            [7, 9, 7, 1, 3],
          ],
          threshold: -0.0026641879230737686,
          right_val: -0.0681547001004219,
          left_val: 0.1523590981960297,
        },
        {
          features: [
            [18, 6, 2, 6, -1],
            [18, 6, 1, 3, 2],
            [19, 9, 1, 3, 2],
          ],
          threshold: -0.008251314982771873,
          right_val: -0.0284806098788977,
          left_val: 0.3668031096458435,
        },
        {
          features: [
            [5, 8, 8, 6, -1],
            [5, 10, 8, 2, 3],
          ],
          threshold: 0.0071076201274991035,
          right_val: -0.0679929703474045,
          left_val: 0.1544535011053085,
        },
        {
          features: [
            [1, 1, 18, 15, -1],
            [10, 1, 9, 15, 2],
          ],
          threshold: -0.4380800127983093,
          right_val: 0.0366394892334938,
          left_val: -0.2887153029441834,
        },
        {
          features: [
            [11, 7, 5, 4, -1],
            [11, 9, 5, 2, 2],
          ],
          threshold: 0.0006371908239088953,
          right_val: 0.0598603412508965,
          left_val: -0.1599503010511398,
        },
        {
          features: [
            [10, 12, 2, 3, -1],
            [11, 12, 1, 3, 2],
          ],
          threshold: -0.00019303169392514974,
          right_val: -0.109248198568821,
          left_val: 0.0867039710283279,
        },
        {
          features: [
            [0, 7, 2, 4, -1],
            [0, 9, 2, 2, 2],
          ],
          threshold: 0.0030723758973181248,
          right_val: -0.1770005971193314,
          left_val: 0.0485439598560333,
        },
        {
          features: [
            [6, 12, 4, 2, -1],
            [6, 12, 2, 1, 2],
            [8, 13, 2, 1, 2],
          ],
          threshold: 0.001834186026826501,
          right_val: 0.1823212951421738,
          left_val: -0.0519012399017811,
        },
        {
          features: [
            [7, 7, 6, 8, -1],
            [7, 11, 6, 4, 2],
          ],
          threshold: 0.063172310590744,
          right_val: -0.4287061095237732,
          left_val: 0.0233088992536068,
        },
        {
          features: [
            [9, 9, 2, 4, -1],
            [9, 11, 2, 2, 2],
          ],
          threshold: 0.0024458649568259716,
          right_val: 0.1197450011968613,
          left_val: -0.0864252895116806,
        },
        {
          features: [
            [9, 10, 6, 6, -1],
            [9, 12, 6, 2, 3],
          ],
          threshold: 0.0011953969951719046,
          right_val: -0.1043049022555351,
          left_val: 0.1168588995933533,
        },
        {
          features: [
            [12, 13, 4, 2, -1],
            [12, 14, 4, 1, 2],
          ],
          threshold: 0.00031024610507301986,
          right_val: -0.1919602006673813,
          left_val: 0.0622819885611534,
        },
        {
          features: [
            [0, 4, 8, 1, -1],
            [4, 4, 4, 1, 2],
          ],
          threshold: -0.0319701582193375,
          right_val: 0.0130875697359443,
          left_val: -0.6418489813804626,
        },
        {
          features: [
            [14, 13, 1, 2, -1],
            [14, 14, 1, 1, 2],
          ],
          threshold: -0.0010163170518353581,
          right_val: 0.0340962111949921,
          left_val: -0.2521066069602966,
        },
        {
          features: [
            [8, 7, 2, 6, -1],
            [8, 7, 1, 3, 2],
            [9, 10, 1, 3, 2],
          ],
          threshold: -0.0005177654093131423,
          right_val: -0.0828137770295143,
          left_val: 0.118740901350975,
        },
        {
          features: [
            [5, 8, 10, 6, -1],
            [5, 8, 5, 3, 2],
            [10, 11, 5, 3, 2],
          ],
          threshold: -0.004079421982169151,
          right_val: 0.0657089725136757,
          left_val: -0.1613530963659287,
        },
        {
          features: [
            [5, 12, 3, 3, -1],
            [5, 13, 3, 1, 3],
          ],
          threshold: 0.009940987452864647,
          right_val: 0.3510453104972839,
          left_val: -0.0301602203398943,
        },
        {
          features: [
            [5, 10, 2, 2, -1],
            [5, 11, 2, 1, 2],
          ],
          threshold: 0.001978876069188118,
          right_val: 0.2329564988613129,
          left_val: -0.0449453592300415,
        },
        {
          features: [
            [6, 2, 4, 15, -1],
            [6, 7, 4, 5, 3],
          ],
          threshold: 0.1097524985671043,
          right_val: -0.6042336225509644,
          left_val: 0.0166202206164598,
        },
        {
          features: [
            [7, 6, 2, 4, -1],
            [7, 6, 1, 2, 2],
            [8, 8, 1, 2, 2],
          ],
          threshold: -0.009202472865581512,
          right_val: 0.0141229098662734,
          left_val: -0.5600035786628723,
        },
        {
          features: [
            [5, 9, 2, 3, -1],
            [5, 10, 2, 1, 3],
          ],
          threshold: 0.0005862619145773351,
          right_val: 0.0841980874538422,
          left_val: -0.1062211990356445,
        },
        {
          features: [
            [15, 16, 2, 2, -1],
            [15, 16, 1, 1, 2],
            [16, 17, 1, 1, 2],
          ],
          threshold: 0.003360175061970949,
          right_val: 0.4182012975215912,
          left_val: -0.021583529189229,
        },
        {
          features: [
            [4, 11, 4, 6, -1],
            [4, 13, 4, 2, 3],
          ],
          threshold: -0.048143669962883,
          right_val: 0.0149544598534703,
          left_val: -0.7209215760231018,
        },
        {
          features: [
            [5, 0, 3, 6, -1],
            [6, 0, 1, 6, 3],
          ],
          threshold: 0.0122098596766591,
          right_val: -0.354821503162384,
          left_val: 0.0215442907065153,
        },
        {
          features: [
            [4, 11, 12, 4, -1],
            [4, 11, 6, 2, 2],
            [10, 13, 6, 2, 2],
          ],
          threshold: -0.0399614498019218,
          right_val: 0.009432842954993248,
          left_val: -0.8884826898574829,
        },
        {
          features: [
            [7, 13, 3, 3, -1],
            [7, 14, 3, 1, 3],
          ],
          threshold: 0.0015312479808926582,
          right_val: 0.1356963068246841,
          left_val: -0.0640708804130554,
        },
        {
          features: [
            [9, 12, 6, 2, -1],
            [9, 13, 6, 1, 2],
          ],
          threshold: 0.0000897911231731996,
          right_val: -0.1839367002248764,
          left_val: 0.0509327687323093,
        },
      ],
      threshold: -1.3418790102005005,
    },
    {
      simpleClassifiers: [
        {
          features: [
            [8, 0, 12, 8, -1],
            [8, 0, 6, 4, 2],
            [14, 4, 6, 4, 2],
          ],
          threshold: -0.0387413688004017,
          right_val: -0.2331219017505646,
          left_val: 0.2877883017063141,
        },
        {
          features: [
            [10, 8, 4, 4, -1],
            [10, 8, 2, 2, 2],
            [12, 10, 2, 2, 2],
          ],
          threshold: -0.002551150042563677,
          right_val: -0.2111607044935226,
          left_val: 0.2510859966278076,
        },
        {
          features: [
            [12, 10, 1, 6, -1],
            [12, 13, 1, 3, 2],
          ],
          threshold: -0.00027973129181191325,
          right_val: -0.3406926989555359,
          left_val: 0.0899169221520424,
        },
        {
          features: [
            [5, 5, 3, 10, -1],
            [6, 5, 1, 10, 3],
          ],
          threshold: 0.0011981100542470813,
          right_val: 0.136026605963707,
          left_val: -0.2254222929477692,
        },
        {
          features: [
            [4, 0, 14, 6, -1],
            [11, 0, 7, 6, 2],
          ],
          threshold: -0.005668607074767351,
          right_val: -0.2808071076869965,
          left_val: 0.0828472599387169,
        },
        {
          features: [
            [9, 7, 2, 6, -1],
            [9, 7, 1, 3, 2],
            [10, 10, 1, 3, 2],
          ],
          threshold: -0.0002764266973827034,
          right_val: -0.1884865015745163,
          left_val: 0.1048547998070717,
        },
        {
          features: [
            [8, 4, 3, 1, -1],
            [9, 4, 1, 1, 3],
          ],
          threshold: 0.0020516710355877876,
          right_val: -0.4860847890377045,
          left_val: 0.0034714280627667904,
        },
        {
          features: [
            [11, 14, 2, 2, -1],
            [11, 15, 2, 1, 2],
          ],
          threshold: -0.00001443524979549693,
          right_val: -0.193561002612114,
          left_val: 0.0842758193612099,
        },
        {
          features: [
            [9, 18, 6, 2, -1],
            [12, 18, 3, 2, 2],
          ],
          threshold: 0.0007441879133693874,
          right_val: 0.1176951974630356,
          left_val: -0.125267505645752,
        },
        {
          features: [
            [8, 12, 8, 6, -1],
            [8, 15, 8, 3, 2],
          ],
          threshold: -0.0499232411384583,
          right_val: 0.027910390868783,
          left_val: -0.4008029997348785,
        },
        {
          features: [
            [7, 0, 8, 6, -1],
            [7, 2, 8, 2, 3],
          ],
          threshold: 0.009269453585147858,
          right_val: 0.1755045056343079,
          left_val: -0.0910889133810997,
        },
        {
          features: [
            [1, 2, 12, 3, -1],
            [5, 2, 4, 3, 3],
          ],
          threshold: -0.007464603055268526,
          right_val: -0.1038549989461899,
          left_val: 0.1638046950101852,
        },
        {
          features: [
            [5, 4, 10, 12, -1],
            [5, 4, 5, 6, 2],
            [10, 10, 5, 6, 2],
          ],
          threshold: -0.008198590949177742,
          right_val: 0.0854150205850601,
          left_val: -0.1916898041963577,
        },
        {
          features: [
            [5, 8, 3, 2, -1],
            [5, 9, 3, 1, 2],
          ],
          threshold: -0.000816906918771565,
          right_val: 0.0408335812389851,
          left_val: -0.3079330921173096,
        },
        {
          features: [
            [7, 12, 1, 3, -1],
            [7, 13, 1, 1, 3],
          ],
          threshold: 0.0028902110643684864,
          right_val: 0.2925941944122315,
          left_val: -0.0503242015838623,
        },
        {
          features: [
            [5, 11, 3, 3, -1],
            [5, 12, 3, 1, 3],
          ],
          threshold: 0.008000819943845272,
          right_val: 0.3196487128734589,
          left_val: -0.0468635782599449,
        },
        {
          features: [
            [8, 10, 6, 9, -1],
            [8, 13, 6, 3, 3],
          ],
          threshold: -0.00583491800352931,
          right_val: 0.0881372615695,
          left_val: -0.1548918038606644,
        },
        {
          features: [
            [7, 8, 3, 6, -1],
            [7, 10, 3, 2, 3],
          ],
          threshold: -0.001249228953383863,
          right_val: 0.0361209884285927,
          left_val: -0.3629462122917175,
        },
        {
          features: [
            [3, 4, 3, 14, -1],
            [4, 4, 1, 14, 3],
          ],
          threshold: 0.022950479760766,
          right_val: 0.2853271961212158,
          left_val: -0.0471197701990604,
        },
        {
          features: [
            [3, 10, 3, 6, -1],
            [4, 10, 1, 6, 3],
          ],
          threshold: -0.006919323932379484,
          right_val: -0.0735475569963455,
          left_val: 0.1787364929914475,
        },
        {
          features: [
            [4, 8, 2, 2, -1],
            [4, 8, 1, 1, 2],
            [5, 9, 1, 1, 2],
          ],
          threshold: -0.00019392240210436285,
          right_val: -0.0924891009926796,
          left_val: 0.1391142010688782,
        },
        {
          features: [
            [10, 13, 2, 3, -1],
            [10, 14, 2, 1, 3],
          ],
          threshold: 0.001981122884899378,
          right_val: -0.3094269037246704,
          left_val: 0.0434480085968971,
        },
        {
          features: [
            [6, 14, 8, 4, -1],
            [6, 14, 4, 2, 2],
            [10, 16, 4, 2, 2],
          ],
          threshold: 0.0160184893757105,
          right_val: 0.3424893915653229,
          left_val: -0.0397189185023308,
        },
        {
          features: [
            [5, 12, 3, 4, -1],
            [6, 12, 1, 4, 3],
          ],
          threshold: 0.009354140609502792,
          right_val: -0.445021003484726,
          left_val: 0.0324826501309872,
        },
        {
          features: [
            [17, 11, 2, 2, -1],
            [17, 11, 1, 1, 2],
            [18, 12, 1, 1, 2],
          ],
          threshold: -0.0013822780456393957,
          right_val: -0.0564102008938789,
          left_val: 0.2162707000970841,
        },
        {
          features: [
            [15, 6, 1, 10, -1],
            [15, 11, 1, 5, 2],
          ],
          threshold: 0.0250658206641674,
          right_val: -0.5395401120185852,
          left_val: 0.0231232307851315,
        },
        {
          features: [
            [7, 1, 12, 6, -1],
            [7, 3, 12, 2, 3],
          ],
          threshold: 0.0597985796630383,
          right_val: -0.3657259047031403,
          left_val: 0.0287475790828466,
        },
        {
          features: [
            [4, 9, 2, 4, -1],
            [4, 9, 1, 2, 2],
            [5, 11, 1, 2, 2],
          ],
          threshold: -0.0027519159484654665,
          right_val: -0.0639909729361534,
          left_val: 0.1749134957790375,
        },
        {
          features: [
            [6, 7, 6, 12, -1],
            [9, 7, 3, 12, 2],
          ],
          threshold: -0.0320936404168606,
          right_val: 0.0409451089799404,
          left_val: -0.2569555044174194,
        },
        {
          features: [
            [7, 6, 2, 3, -1],
            [8, 6, 1, 3, 2],
          ],
          threshold: -0.0023349749390035868,
          right_val: -0.0728366896510124,
          left_val: 0.1543388068675995,
        },
        {
          features: [
            [0, 1, 1, 3, -1],
            [0, 2, 1, 1, 3],
          ],
          threshold: 0.0002689767861738801,
          right_val: -0.1551322042942047,
          left_val: 0.0727212429046631,
        },
        {
          features: [
            [0, 1, 1, 3, -1],
            [0, 2, 1, 1, 3],
          ],
          threshold: -0.0008981340797618032,
          right_val: 0.0537382215261459,
          left_val: -0.2069962024688721,
        },
        {
          features: [
            [11, 15, 3, 5, -1],
            [12, 15, 1, 5, 3],
          ],
          threshold: 0.003852186957374215,
          right_val: -0.2807596921920776,
          left_val: 0.0365620106458664,
        },
        {
          features: [
            [8, 6, 4, 6, -1],
            [8, 8, 4, 2, 3],
          ],
          threshold: 0.0134400902315974,
          right_val: 0.3187696039676666,
          left_val: -0.0360464788973331,
        },
        {
          features: [
            [5, 3, 3, 12, -1],
            [5, 7, 3, 4, 3],
          ],
          threshold: 0.007712911814451218,
          right_val: -0.1178748980164528,
          left_val: 0.0959600135684013,
        },
        {
          features: [
            [7, 9, 2, 2, -1],
            [7, 9, 1, 1, 2],
            [8, 10, 1, 1, 2],
          ],
          threshold: 0.00021991880203131586,
          right_val: 0.0849395766854286,
          left_val: -0.1324986964464188,
        },
        {
          features: [
            [4, 4, 2, 12, -1],
            [4, 8, 2, 4, 3],
          ],
          threshold: -0.007478117011487484,
          right_val: 0.0503109283745289,
          left_val: -0.2307303994894028,
        },
        {
          features: [
            [4, 5, 7, 3, -1],
            [4, 6, 7, 1, 3],
          ],
          threshold: 0.00891752727329731,
          right_val: 0.203206405043602,
          left_val: -0.0539247691631317,
        },
        {
          features: [
            [13, 5, 2, 3, -1],
            [13, 6, 2, 1, 3],
          ],
          threshold: 0.0022819850128144026,
          right_val: -0.3084133863449097,
          left_val: 0.0352649092674255,
        },
        {
          features: [
            [4, 0, 2, 2, -1],
            [4, 0, 1, 1, 2],
            [5, 1, 1, 1, 2],
          ],
          threshold: 0.002641300903633237,
          right_val: 0.3172146081924439,
          left_val: -0.0329392291605473,
        },
        {
          features: [
            [11, 8, 3, 11, -1],
            [12, 8, 1, 11, 3],
          ],
          threshold: -0.001460568979382515,
          right_val: 0.0633745566010475,
          left_val: -0.1715427935123444,
        },
        {
          features: [
            [4, 0, 2, 2, -1],
            [4, 0, 1, 1, 2],
            [5, 1, 1, 1, 2],
          ],
          threshold: -0.00319934100843966,
          right_val: -0.0307174902409315,
          left_val: 0.3450168073177338,
        },
        {
          features: [
            [9, 3, 2, 2, -1],
            [9, 3, 1, 1, 2],
            [10, 4, 1, 1, 2],
          ],
          threshold: 0.0023919229861348867,
          right_val: -0.4856416881084442,
          left_val: 0.0208875201642513,
        },
        {
          features: [
            [7, 11, 3, 2, -1],
            [8, 11, 1, 2, 3],
          ],
          threshold: -0.003599761053919792,
          right_val: -0.0356058217585087,
          left_val: 0.289005309343338,
        },
        {
          features: [
            [11, 12, 2, 1, -1],
            [12, 12, 1, 1, 2],
          ],
          threshold: -0.000014754279618500732,
          right_val: -0.1458061933517456,
          left_val: 0.0727446228265762,
        },
        {
          features: [
            [8, 8, 4, 2, -1],
            [10, 8, 2, 2, 2],
          ],
          threshold: 0.0159683600068092,
          right_val: -0.6744545102119446,
          left_val: 0.0125485500320792,
        },
        {
          features: [
            [17, 15, 3, 1, -1],
            [18, 15, 1, 1, 3],
          ],
          threshold: -0.004075208213180304,
          right_val: -0.0321554504334927,
          left_val: 0.3144747018814087,
        },
        {
          features: [
            [12, 6, 2, 4, -1],
            [12, 6, 1, 2, 2],
            [13, 8, 1, 2, 2],
          ],
          threshold: 0.00007543287210864946,
          right_val: 0.0896650925278664,
          left_val: -0.0997386574745178,
        },
        {
          features: [
            [8, 3, 9, 11, -1],
            [11, 3, 3, 11, 3],
          ],
          threshold: -0.0396322496235371,
          right_val: -0.0348007306456566,
          left_val: 0.276174008846283,
        },
        {
          features: [
            [10, 8, 2, 2, -1],
            [11, 8, 1, 2, 2],
          ],
          threshold: 0.000029354610887821764,
          right_val: 0.0885196104645729,
          left_val: -0.1402300000190735,
        },
        {
          features: [
            [12, 5, 3, 9, -1],
            [12, 8, 3, 3, 3],
          ],
          threshold: 0.0318189896643162,
          right_val: -0.3395833969116211,
          left_val: 0.029925649985671,
        },
        {
          features: [
            [13, 0, 6, 17, -1],
            [15, 0, 2, 17, 3],
          ],
          threshold: 0.1269010007381439,
          right_val: -0.8993232846260071,
          left_val: 0.0112633900716901,
        },
        {
          features: [
            [6, 6, 3, 4, -1],
            [7, 6, 1, 4, 3],
          ],
          threshold: -0.003595232032239437,
          right_val: -0.0581134893000126,
          left_val: 0.1775175929069519,
        },
        {
          features: [
            [5, 6, 4, 7, -1],
            [7, 6, 2, 7, 2],
          ],
          threshold: -0.0192312598228455,
          right_val: 0.0405871011316776,
          left_val: -0.3317398130893707,
        },
        {
          features: [
            [7, 5, 3, 2, -1],
            [8, 5, 1, 2, 3],
          ],
          threshold: 0.0022836721036583185,
          right_val: -0.2837064862251282,
          left_val: 0.0372060090303421,
        },
        {
          features: [
            [7, 15, 6, 2, -1],
            [7, 15, 3, 1, 2],
            [10, 16, 3, 1, 2],
          ],
          threshold: -0.0016381660243496299,
          right_val: -0.0677815228700638,
          left_val: 0.1462917029857636,
        },
        {
          features: [
            [11, 14, 1, 3, -1],
            [11, 15, 1, 1, 3],
          ],
          threshold: 0.0021173330023884773,
          right_val: -0.4392867982387543,
          left_val: 0.0207739695906639,
        },
        {
          features: [
            [2, 12, 6, 7, -1],
            [4, 12, 2, 7, 3],
          ],
          threshold: 0.006471062079071999,
          right_val: 0.1398161053657532,
          left_val: -0.0721339285373688,
        },
        {
          features: [
            [11, 17, 5, 3, -1],
            [11, 18, 5, 1, 3],
          ],
          threshold: -0.003143162000924349,
          right_val: 0.0475446693599224,
          left_val: -0.1990344971418381,
        },
        {
          features: [
            [17, 11, 2, 2, -1],
            [17, 11, 1, 1, 2],
            [18, 12, 1, 1, 2],
          ],
          threshold: 0.001605664030648768,
          right_val: 0.2593173980712891,
          left_val: -0.0397518984973431,
        },
        {
          features: [
            [10, 17, 6, 3, -1],
            [10, 18, 6, 1, 3],
          ],
          threshold: 0.004874083213508129,
          right_val: -0.2761198878288269,
          left_val: 0.0340823791921139,
        },
        {
          features: [
            [2, 15, 1, 2, -1],
            [2, 16, 1, 1, 2],
          ],
          threshold: -0.00009635410970076919,
          right_val: 0.0835031867027283,
          left_val: -0.1070960983633995,
        },
        {
          features: [
            [8, 6, 3, 3, -1],
            [8, 7, 3, 1, 3],
          ],
          threshold: 0.007770645897835493,
          right_val: 0.2949387133121491,
          left_val: -0.030095349997282,
        },
        {
          features: [
            [7, 7, 1, 2, -1],
            [7, 8, 1, 1, 2],
          ],
          threshold: 0.00013028859393671155,
          right_val: 0.0945786833763123,
          left_val: -0.11232890188694,
        },
        {
          features: [
            [2, 15, 2, 2, -1],
            [2, 16, 2, 1, 2],
          ],
          threshold: 0.0012239719508215785,
          right_val: -0.1810626983642578,
          left_val: 0.0519996210932732,
        },
        {
          features: [
            [3, 16, 3, 1, -1],
            [4, 16, 1, 1, 3],
          ],
          threshold: -0.0008754974114708602,
          right_val: -0.0750989466905594,
          left_val: 0.142766997218132,
        },
        {
          features: [
            [3, 0, 3, 20, -1],
            [4, 0, 1, 20, 3],
          ],
          threshold: -0.088081993162632,
          right_val: 0.0143536403775215,
          left_val: -0.7084882855415344,
        },
        {
          features: [
            [8, 2, 12, 12, -1],
            [14, 2, 6, 12, 2],
          ],
          threshold: -0.3285416066646576,
          right_val: 0.0166046004742384,
          left_val: -0.496874213218689,
        },
        {
          features: [
            [5, 3, 2, 3, -1],
            [5, 4, 2, 1, 3],
          ],
          threshold: 0.009869612753391266,
          right_val: -0.4997830092906952,
          left_val: 0.019364370033145,
        },
        {
          features: [
            [3, 4, 2, 2, -1],
            [3, 4, 1, 1, 2],
            [4, 5, 1, 1, 2],
          ],
          threshold: -0.002727363957092166,
          right_val: -0.0328314006328583,
          left_val: 0.296125203371048,
        },
        {
          features: [
            [0, 15, 20, 3, -1],
            [10, 15, 10, 3, 2],
          ],
          threshold: 0.0991001427173615,
          right_val: -0.4734495878219605,
          left_val: 0.0197990797460079,
        },
        {
          features: [
            [6, 13, 2, 4, -1],
            [6, 13, 1, 2, 2],
            [7, 15, 1, 2, 2],
          ],
          threshold: -0.006350189913064241,
          right_val: 0.0169860105961561,
          left_val: -0.5150471925735474,
        },
        {
          features: [
            [12, 8, 3, 7, -1],
            [13, 8, 1, 7, 3],
          ],
          threshold: 0.00002959692028525751,
          right_val: 0.0896561071276665,
          left_val: -0.1092301979660988,
        },
        {
          features: [
            [8, 9, 6, 10, -1],
            [8, 9, 3, 5, 2],
            [11, 14, 3, 5, 2],
          ],
          threshold: 0.0212476700544357,
          right_val: 0.2268427014350891,
          left_val: -0.0414621904492378,
        },
        {
          features: [
            [2, 10, 16, 2, -1],
            [10, 10, 8, 2, 2],
          ],
          threshold: -0.0729779899120331,
          right_val: 0.0166788697242737,
          left_val: -0.6322783827781677,
        },
        {
          features: [
            [5, 3, 15, 6, -1],
            [10, 3, 5, 6, 3],
          ],
          threshold: 0.1623091995716095,
          right_val: 0.3753314018249512,
          left_val: -0.0256619099527597,
        },
        {
          features: [
            [10, 14, 2, 1, -1],
            [11, 14, 1, 1, 2],
          ],
          threshold: -0.00001459081977372989,
          right_val: -0.1190098971128464,
          left_val: 0.0856136009097099,
        },
        {
          features: [
            [9, 11, 4, 4, -1],
            [11, 11, 2, 4, 2],
          ],
          threshold: 0.0027719149366021156,
          right_val: 0.2031137943267822,
          left_val: -0.0546492487192154,
        },
        {
          features: [
            [12, 8, 2, 4, -1],
            [12, 10, 2, 2, 2],
          ],
          threshold: -0.008748435415327549,
          right_val: 0.01557189039886,
          left_val: -0.7367451786994934,
        },
        {
          features: [
            [1, 3, 10, 14, -1],
            [1, 3, 5, 7, 2],
            [6, 10, 5, 7, 2],
          ],
          threshold: 0.0136791998520494,
          right_val: -0.1159050017595291,
          left_val: 0.078902930021286,
        },
        {
          features: [
            [8, 0, 3, 4, -1],
            [8, 2, 3, 2, 2],
          ],
          threshold: -0.011001150123775,
          right_val: -0.032384991645813,
          left_val: 0.316908210515976,
        },
        {
          features: [
            [10, 2, 2, 1, -1],
            [11, 2, 1, 1, 2],
          ],
          threshold: 0.00032964799902401865,
          right_val: -0.2045145034790039,
          left_val: 0.0500165298581123,
        },
        {
          features: [
            [5, 12, 5, 3, -1],
            [5, 13, 5, 1, 3],
          ],
          threshold: 0.002775327069684863,
          right_val: 0.1593590974807739,
          left_val: -0.0674074292182922,
        },
        {
          features: [
            [7, 12, 1, 3, -1],
            [7, 13, 1, 1, 3],
          ],
          threshold: -0.002874024910852313,
          right_val: -0.0510314889252186,
          left_val: 0.2245596051216126,
        },
        {
          features: [
            [10, 12, 6, 3, -1],
            [10, 13, 6, 1, 3],
          ],
          threshold: 0.0008163166930899024,
          right_val: -0.1479161977767944,
          left_val: 0.0698495507240295,
        },
        {
          features: [
            [6, 4, 1, 3, -1],
            [6, 5, 1, 1, 3],
          ],
          threshold: 0.0037573580630123615,
          right_val: -0.3138797879219055,
          left_val: 0.0315946005284786,
        },
        {
          features: [
            [2, 0, 18, 3, -1],
            [2, 1, 18, 1, 3],
          ],
          threshold: -0.003490238916128874,
          right_val: -0.0859479308128357,
          left_val: 0.1163842976093292,
        },
        {
          features: [
            [8, 8, 11, 6, -1],
            [8, 10, 11, 2, 3],
          ],
          threshold: -0.0294153206050396,
          right_val: -0.0161406099796295,
          left_val: 0.6840342879295349,
        },
        {
          features: [
            [2, 6, 10, 8, -1],
            [2, 6, 5, 4, 2],
            [7, 10, 5, 4, 2],
          ],
          threshold: -0.008809538558125496,
          right_val: 0.0499508902430534,
          left_val: -0.2077531963586807,
        },
        {
          features: [
            [9, 2, 6, 2, -1],
            [11, 2, 2, 2, 3],
          ],
          threshold: -0.0154599398374558,
          right_val: 0.0200655590742826,
          left_val: -0.4874846041202545,
        },
        {
          features: [
            [13, 9, 6, 3, -1],
            [15, 9, 2, 3, 3],
          ],
          threshold: -0.0364813692867756,
          right_val: 0.0158509891480207,
          left_val: -0.5239514112472534,
        },
        {
          features: [
            [5, 3, 1, 2, -1],
            [5, 4, 1, 1, 2],
          ],
          threshold: -0.00008893736230675131,
          right_val: 0.0669268071651459,
          left_val: -0.1329932063817978,
        },
        {
          features: [
            [1, 7, 3, 1, -1],
            [2, 7, 1, 1, 3],
          ],
          threshold: 0.0001453670993214473,
          right_val: -0.1043582037091255,
          left_val: 0.0871703699231148,
        },
        {
          features: [
            [0, 6, 8, 6, -1],
            [4, 6, 4, 6, 2],
          ],
          threshold: 0.152168795466423,
          right_val: -0.649701714515686,
          left_val: 0.0161405801773071,
        },
        {
          features: [
            [11, 9, 1, 2, -1],
            [11, 10, 1, 1, 2],
          ],
          threshold: -0.00042344830580987036,
          right_val: -0.0529745407402515,
          left_val: 0.1804583966732025,
        },
        {
          features: [
            [12, 13, 1, 2, -1],
            [12, 14, 1, 1, 2],
          ],
          threshold: 0.0010672640055418015,
          right_val: -0.482420414686203,
          left_val: 0.0205483809113503,
        },
        {
          features: [
            [10, 15, 10, 4, -1],
            [10, 15, 5, 2, 2],
            [15, 17, 5, 2, 2],
          ],
          threshold: 0.0154916802421212,
          right_val: 0.1836396008729935,
          left_val: -0.0515408515930176,
        },
        {
          features: [
            [12, 11, 1, 2, -1],
            [12, 12, 1, 1, 2],
          ],
          threshold: 0.0006139330798760056,
          right_val: -0.3103170096874237,
          left_val: 0.0299837291240692,
        },
        {
          features: [
            [6, 11, 2, 1, -1],
            [7, 11, 1, 1, 2],
          ],
          threshold: -0.000014619939975091256,
          right_val: -0.0916341319680214,
          left_val: 0.1036849990487099,
        },
        {
          features: [
            [11, 3, 3, 2, -1],
            [12, 3, 1, 2, 3],
          ],
          threshold: 0.006990064866840839,
          right_val: -0.5948538184165955,
          left_val: 0.014683909714222,
        },
        {
          features: [
            [4, 7, 6, 5, -1],
            [7, 7, 3, 5, 2],
          ],
          threshold: -0.005300011020153761,
          right_val: 0.0705427825450897,
          left_val: -0.1245777010917664,
        },
        {
          features: [
            [3, 16, 3, 1, -1],
            [4, 16, 1, 1, 3],
          ],
          threshold: 0.0005028998712077737,
          right_val: 0.1222871020436287,
          left_val: -0.0771356895565987,
        },
        {
          features: [
            [4, 7, 6, 5, -1],
            [7, 7, 3, 5, 2],
          ],
          threshold: 0.0111909797415137,
          right_val: -0.1809180974960327,
          left_val: 0.0503080599009991,
        },
        {
          features: [
            [5, 7, 6, 3, -1],
            [7, 7, 2, 3, 3],
          ],
          threshold: 0.0170198194682598,
          right_val: 0.3085198104381561,
          left_val: -0.0388167686760426,
        },
        {
          features: [
            [7, 8, 4, 8, -1],
            [7, 8, 2, 4, 2],
            [9, 12, 2, 4, 2],
          ],
          threshold: -0.0005824157269671559,
          right_val: -0.0761154815554619,
          left_val: 0.1253779977560043,
        },
        {
          features: [
            [4, 2, 14, 12, -1],
            [4, 6, 14, 4, 3],
          ],
          threshold: 0.0200366694480181,
          right_val: -0.1808298975229263,
          left_val: 0.0498994812369347,
        },
        {
          features: [
            [4, 14, 2, 6, -1],
            [4, 14, 1, 3, 2],
            [5, 17, 1, 3, 2],
          ],
          threshold: -0.005432881880551577,
          right_val: -0.0423854105174541,
          left_val: 0.2340977042913437,
        },
        {
          features: [
            [7, 11, 2, 4, -1],
            [7, 13, 2, 2, 2],
          ],
          threshold: -0.00002953536022687331,
          right_val: -0.1575352996587753,
          left_val: 0.0576302409172058,
        },
        {
          features: [
            [6, 4, 10, 15, -1],
            [6, 9, 10, 5, 3],
          ],
          threshold: -0.1035237014293671,
          right_val: -0.0129899298772216,
          left_val: 0.7158774137496948,
        },
        {
          features: [
            [6, 11, 12, 6, -1],
            [6, 13, 12, 2, 3],
          ],
          threshold: -0.0121222697198391,
          right_val: 0.0665664374828339,
          left_val: -0.1478897035121918,
        },
        {
          features: [
            [6, 17, 4, 3, -1],
            [6, 18, 4, 1, 3],
          ],
          threshold: 0.0030254870653152466,
          right_val: 0.1714082956314087,
          left_val: -0.0543786287307739,
        },
        {
          features: [
            [6, 17, 4, 3, -1],
            [6, 18, 4, 1, 3],
          ],
          threshold: -0.005811107810586691,
          right_val: -0.0576526410877705,
          left_val: 0.244221493601799,
        },
        {
          features: [
            [9, 13, 3, 7, -1],
            [10, 13, 1, 7, 3],
          ],
          threshold: 0.008283074013888836,
          right_val: -0.4296199977397919,
          left_val: 0.0227204002439976,
        },
        {
          features: [
            [2, 8, 5, 2, -1],
            [2, 9, 5, 1, 2],
          ],
          threshold: 0.0123751200735569,
          right_val: -0.3750562965869904,
          left_val: 0.0228102896362543,
        },
        {
          features: [
            [14, 1, 3, 8, -1],
            [15, 1, 1, 8, 3],
          ],
          threshold: 0.0192112103104591,
          right_val: -0.6552945971488953,
          left_val: 0.0117910597473383,
        },
        {
          features: [
            [2, 12, 1, 2, -1],
            [2, 13, 1, 1, 2],
          ],
          threshold: 0.0003184312954545021,
          right_val: -0.1399556994438171,
          left_val: 0.0641300603747368,
        },
        {
          features: [
            [8, 6, 2, 2, -1],
            [8, 6, 1, 1, 2],
            [9, 7, 1, 1, 2],
          ],
          threshold: 0.000842246285174042,
          right_val: 0.1752558052539825,
          left_val: -0.0541342794895172,
        },
        {
          features: [
            [4, 3, 10, 12, -1],
            [4, 9, 10, 6, 2],
          ],
          threshold: -0.1608504951000214,
          right_val: 0.007854947820305824,
          left_val: -0.9457141757011414,
        },
        {
          features: [
            [5, 9, 8, 4, -1],
            [5, 9, 4, 2, 2],
            [9, 11, 4, 2, 2],
          ],
          threshold: -0.0016774870455265045,
          right_val: 0.0457870289683342,
          left_val: -0.1916612982749939,
        },
        {
          features: [
            [9, 9, 4, 4, -1],
            [9, 11, 4, 2, 2],
          ],
          threshold: -0.0018989649834111333,
          right_val: -0.0658969134092331,
          left_val: 0.1578315049409866,
        },
        {
          features: [
            [5, 10, 4, 2, -1],
            [5, 11, 4, 1, 2],
          ],
          threshold: 0.0004020576016046107,
          right_val: 0.1311838030815125,
          left_val: -0.0735990926623344,
        },
        {
          features: [
            [6, 17, 2, 1, -1],
            [7, 17, 1, 1, 2],
          ],
          threshold: 0.0024369959719479084,
          right_val: -0.4274596869945526,
          left_val: 0.0235228706151247,
        },
        {
          features: [
            [12, 12, 2, 1, -1],
            [13, 12, 1, 1, 2],
          ],
          threshold: -0.00002848840995284263,
          right_val: -0.135990098118782,
          left_val: 0.0632806196808815,
        },
        {
          features: [
            [11, 6, 4, 8, -1],
            [13, 6, 2, 8, 2],
          ],
          threshold: 0.019538639113307,
          right_val: 0.4753474891185761,
          left_val: -0.0214582700282335,
        },
        {
          features: [
            [9, 4, 3, 10, -1],
            [10, 4, 1, 10, 3],
          ],
          threshold: -0.0016530340071767569,
          right_val: 0.0594559796154499,
          left_val: -0.153232604265213,
        },
        {
          features: [
            [0, 18, 9, 2, -1],
            [3, 18, 3, 2, 3],
          ],
          threshold: -0.0021052840165793896,
          right_val: -0.0831181034445763,
          left_val: 0.1101763993501663,
        },
        {
          features: [
            [15, 13, 3, 3, -1],
            [15, 14, 3, 1, 3],
          ],
          threshold: -0.0045266482047736645,
          right_val: -0.0357439406216145,
          left_val: 0.2581537961959839,
        },
        {
          features: [
            [9, 12, 2, 2, -1],
            [9, 12, 1, 1, 2],
            [10, 13, 1, 1, 2],
          ],
          threshold: -0.0001627556048333645,
          right_val: 0.0692957267165184,
          left_val: -0.1354829072952271,
        },
        {
          features: [
            [13, 12, 7, 3, -1],
            [13, 13, 7, 1, 3],
          ],
          threshold: -0.003304821904748678,
          right_val: -0.0521564409136772,
          left_val: 0.1780602931976318,
        },
        {
          features: [
            [14, 10, 6, 2, -1],
            [14, 11, 6, 1, 2],
          ],
          threshold: -0.005190521012991667,
          right_val: 0.025990990921855,
          left_val: -0.3489732146263123,
        },
        {
          features: [
            [14, 5, 5, 14, -1],
            [14, 12, 5, 7, 2],
          ],
          threshold: 0.1119081005454063,
          right_val: -0.2959755063056946,
          left_val: 0.0299620293080807,
        },
        {
          features: [
            [4, 16, 5, 3, -1],
            [4, 17, 5, 1, 3],
          ],
          threshold: -0.005287313833832741,
          right_val: -0.0502162985503674,
          left_val: 0.1856449991464615,
        },
        {
          features: [
            [5, 16, 5, 3, -1],
            [5, 17, 5, 1, 3],
          ],
          threshold: 0.0026098049711436033,
          right_val: 0.1436513066291809,
          left_val: -0.0735592767596245,
        },
        {
          features: [
            [8, 14, 4, 5, -1],
            [10, 14, 2, 5, 2],
          ],
          threshold: -0.002858192892745137,
          right_val: 0.0754330828785896,
          left_val: -0.1260513961315155,
        },
        {
          features: [
            [9, 14, 2, 1, -1],
            [10, 14, 1, 1, 2],
          ],
          threshold: -0.00002955568015750032,
          right_val: -0.103862002491951,
          left_val: 0.1073331013321877,
        },
        {
          features: [
            [6, 10, 6, 2, -1],
            [6, 10, 3, 1, 2],
            [9, 11, 3, 1, 2],
          ],
          threshold: 0.00005902356133447029,
          right_val: 0.0764783918857574,
          left_val: -0.1302911937236786,
        },
        {
          features: [
            [5, 8, 6, 6, -1],
            [8, 8, 3, 6, 2],
          ],
          threshold: -0.043344721198082,
          right_val: 0.0141733000054955,
          left_val: -0.6929922103881836,
        },
        {
          features: [
            [10, 13, 7, 6, -1],
            [10, 15, 7, 2, 3],
          ],
          threshold: -0.0469469986855984,
          right_val: 0.012422920204699,
          left_val: -0.558037519454956,
        },
        {
          features: [
            [4, 1, 2, 8, -1],
            [4, 1, 1, 4, 2],
            [5, 5, 1, 4, 2],
          ],
          threshold: -0.015189060010016,
          right_val: -0.02556411921978,
          left_val: 0.3704977035522461,
        },
        {
          features: [
            [3, 6, 6, 4, -1],
            [3, 6, 3, 2, 2],
            [6, 8, 3, 2, 2],
          ],
          threshold: 0.0163618791848421,
          right_val: -0.3427892029285431,
          left_val: 0.0270499791949987,
        },
        {
          features: [
            [15, 2, 3, 13, -1],
            [16, 2, 1, 13, 3],
          ],
          threshold: 0.0407528392970562,
          right_val: -0.8868371248245239,
          left_val: 0.009399525821208954,
        },
        {
          features: [
            [16, 10, 2, 6, -1],
            [16, 10, 1, 3, 2],
            [17, 13, 1, 3, 2],
          ],
          threshold: -0.0108798695728183,
          right_val: -0.0194508600980043,
          left_val: 0.5326058268547058,
        },
        {
          features: [
            [13, 19, 2, 1, -1],
            [14, 19, 1, 1, 2],
          ],
          threshold: -0.00007753825775580481,
          right_val: 0.0772882327437401,
          left_val: -0.1169624999165535,
        },
        {
          features: [
            [7, 11, 2, 1, -1],
            [8, 11, 1, 1, 2],
          ],
          threshold: -0.0004095307958777994,
          right_val: -0.0537114888429642,
          left_val: 0.1621436029672623,
        },
        {
          features: [
            [4, 10, 3, 4, -1],
            [5, 10, 1, 4, 3],
          ],
          threshold: -0.0184642393141985,
          right_val: 0.0198381897062063,
          left_val: -0.5084478855133057,
        },
        {
          features: [
            [4, 7, 2, 4, -1],
            [4, 7, 1, 2, 2],
            [5, 9, 1, 2, 2],
          ],
          threshold: -0.005678812973201275,
          right_val: -0.0302039906382561,
          left_val: 0.3020392060279846,
        },
        {
          features: [
            [10, 7, 5, 4, -1],
            [10, 9, 5, 2, 2],
          ],
          threshold: 0.00038324110209941864,
          right_val: 0.0549020282924175,
          left_val: -0.1684108972549439,
        },
        {
          features: [
            [7, 4, 8, 16, -1],
            [7, 4, 4, 8, 2],
            [11, 12, 4, 8, 2],
          ],
          threshold: 0.006476155016571283,
          right_val: -0.1074616014957428,
          left_val: 0.0951402634382248,
        },
        {
          features: [
            [5, 9, 10, 6, -1],
            [5, 9, 5, 3, 2],
            [10, 12, 5, 3, 2],
          ],
          threshold: -0.002437785966321826,
          right_val: 0.0634076073765755,
          left_val: -0.1564771980047226,
        },
        {
          features: [
            [5, 11, 3, 2, -1],
            [5, 12, 3, 1, 2],
          ],
          threshold: 0.0005415629129856825,
          right_val: 0.1844162940979004,
          left_val: -0.0659622997045517,
        },
        {
          features: [
            [12, 12, 4, 8, -1],
            [12, 16, 4, 4, 2],
          ],
          threshold: 0.0279170293360949,
          right_val: 0.3503274023532867,
          left_val: -0.0275902301073074,
        },
        {
          features: [
            [8, 13, 6, 2, -1],
            [8, 14, 6, 1, 2],
          ],
          threshold: 0.00046622849185951054,
          right_val: -0.226241797208786,
          left_val: 0.0496288202702999,
        },
        {
          features: [
            [3, 12, 5, 6, -1],
            [3, 14, 5, 2, 3],
          ],
          threshold: -0.0373167991638184,
          right_val: 0.0213376805186272,
          left_val: -0.4297817051410675,
        },
        {
          features: [
            [16, 0, 2, 2, -1],
            [16, 0, 1, 1, 2],
            [17, 1, 1, 1, 2],
          ],
          threshold: -0.002604711102321744,
          right_val: -0.0254050493240356,
          left_val: 0.3665099143981934,
        },
        {
          features: [
            [13, 3, 3, 4, -1],
            [14, 3, 1, 4, 3],
          ],
          threshold: 0.005192713811993599,
          right_val: -0.3347857892513275,
          left_val: 0.0268779303878546,
        },
        {
          features: [
            [15, 11, 3, 1, -1],
            [16, 11, 1, 1, 3],
          ],
          threshold: 0.0030462879221886396,
          right_val: 0.2978835999965668,
          left_val: -0.030848290771246,
        },
        {
          features: [
            [14, 0, 6, 5, -1],
            [16, 0, 2, 5, 3],
          ],
          threshold: -0.00041325599886476994,
          right_val: -0.1214753016829491,
          left_val: 0.072986789047718,
        },
        {
          features: [
            [10, 1, 8, 18, -1],
            [10, 10, 8, 9, 2],
          ],
          threshold: -0.1145612001419067,
          right_val: -0.0333798006176949,
          left_val: 0.3195546865463257,
        },
        {
          features: [
            [11, 5, 3, 2, -1],
            [11, 6, 3, 1, 2],
          ],
          threshold: -0.0013044059742242098,
          right_val: 0.0546343699097633,
          left_val: -0.2062529027462006,
        },
        {
          features: [
            [5, 5, 2, 1, -1],
            [6, 5, 1, 1, 2],
          ],
          threshold: 0.00004504508979152888,
          right_val: 0.0781233832240105,
          left_val: -0.1137655004858971,
        },
        {
          features: [
            [3, 4, 3, 3, -1],
            [4, 4, 1, 3, 3],
          ],
          threshold: 0.001889031962491572,
          right_val: 0.1700129956007004,
          left_val: -0.0655787289142609,
        },
        {
          features: [
            [11, 14, 1, 3, -1],
            [11, 15, 1, 1, 3],
          ],
          threshold: -0.000541079614777118,
          right_val: 0.0516118109226227,
          left_val: -0.1818414032459259,
        },
        {
          features: [
            [16, 13, 3, 3, -1],
            [16, 14, 3, 1, 3],
          ],
          threshold: 0.004415016155689955,
          right_val: 0.2493844926357269,
          left_val: -0.03632478043437,
        },
        {
          features: [
            [15, 8, 5, 12, -1],
            [15, 14, 5, 6, 2],
          ],
          threshold: -0.0218780506402254,
          right_val: 0.0548111088573933,
          left_val: -0.1764367967844009,
        },
        {
          features: [
            [3, 0, 3, 10, -1],
            [4, 0, 1, 10, 3],
          ],
          threshold: -0.002032821998000145,
          right_val: -0.0971294119954109,
          left_val: 0.0942661836743355,
        },
        {
          features: [
            [15, 15, 1, 2, -1],
            [15, 16, 1, 1, 2],
          ],
          threshold: 0.00026754371356219053,
          right_val: -0.1544201970100403,
          left_val: 0.0574879311025143,
        },
        {
          features: [
            [15, 0, 4, 2, -1],
            [15, 0, 2, 1, 2],
            [17, 1, 2, 1, 2],
          ],
          threshold: 0.001406142022460699,
          right_val: 0.1881417036056519,
          left_val: -0.0502689592540264,
        },
        {
          features: [
            [17, 2, 2, 1, -1],
            [18, 2, 1, 1, 2],
          ],
          threshold: 0.00020725419744849205,
          right_val: -0.1253813058137894,
          left_val: 0.0776591897010803,
        },
        {
          features: [
            [8, 13, 1, 3, -1],
            [8, 14, 1, 1, 3],
          ],
          threshold: 0.0018001600401476026,
          right_val: 0.2243064939975739,
          left_val: -0.0426756404340267,
        },
        {
          features: [
            [9, 1, 2, 6, -1],
            [9, 1, 1, 3, 2],
            [10, 4, 1, 3, 2],
          ],
          threshold: -0.004674423020333052,
          right_val: 0.0293644201010466,
          left_val: -0.3348047137260437,
        },
        {
          features: [
            [1, 12, 9, 3, -1],
            [1, 13, 9, 1, 3],
          ],
          threshold: 0.00721103698015213,
          right_val: 0.1889156997203827,
          left_val: -0.0524413287639618,
        },
        {
          features: [
            [12, 14, 3, 3, -1],
            [12, 15, 3, 1, 3],
          ],
          threshold: 0.0023627521004527807,
          right_val: -0.2720044851303101,
          left_val: 0.0344000607728958,
        },
        {
          features: [
            [15, 10, 3, 1, -1],
            [16, 10, 1, 1, 3],
          ],
          threshold: -0.0013181479880586267,
          right_val: -0.0563636310398579,
          left_val: 0.1776771992444992,
        },
        {
          features: [
            [9, 6, 9, 1, -1],
            [12, 6, 3, 1, 3],
          ],
          threshold: -0.00017586319881957024,
          right_val: -0.1041231006383896,
          left_val: 0.0915342420339584,
        },
        {
          features: [
            [12, 5, 3, 7, -1],
            [13, 5, 1, 7, 3],
          ],
          threshold: -0.00025801590527407825,
          right_val: 0.0813818126916885,
          left_val: -0.1122677996754646,
        },
        {
          features: [
            [8, 2, 2, 2, -1],
            [8, 3, 2, 1, 2],
          ],
          threshold: 0.00009679095091996714,
          right_val: 0.0718831866979599,
          left_val: -0.1188192963600159,
        },
        {
          features: [
            [7, 0, 9, 2, -1],
            [7, 1, 9, 1, 2],
          ],
          threshold: 0.008200111798942089,
          right_val: 0.2279089987277985,
          left_val: -0.0402545295655727,
        },
        {
          features: [
            [13, 5, 2, 5, -1],
            [14, 5, 1, 5, 2],
          ],
          threshold: -0.0006727795116603374,
          right_val: 0.1277576982975006,
          left_val: -0.0709791034460068,
        },
        {
          features: [
            [14, 2, 3, 6, -1],
            [15, 2, 1, 6, 3],
          ],
          threshold: 0.00037424470065161586,
          right_val: -0.1364576071500778,
          left_val: 0.0670964494347572,
        },
        {
          features: [
            [8, 6, 4, 3, -1],
            [8, 7, 4, 1, 3],
          ],
          threshold: 0.002574112033471465,
          right_val: 0.1672026067972183,
          left_val: -0.054319828748703,
        },
        {
          features: [
            [6, 8, 1, 9, -1],
            [6, 11, 1, 3, 3],
          ],
          threshold: 0.0004388469096738845,
          right_val: -0.1102467998862267,
          left_val: 0.0821140334010124,
        },
        {
          features: [
            [3, 9, 7, 6, -1],
            [3, 11, 7, 2, 3],
          ],
          threshold: -0.048180628567934,
          right_val: 0.0122232101857662,
          left_val: -0.7221773266792297,
        },
        {
          features: [
            [6, 6, 2, 3, -1],
            [6, 7, 2, 1, 3],
          ],
          threshold: 0.009983690455555916,
          right_val: -0.6744806170463562,
          left_val: 0.0121956402435899,
        },
        {
          features: [
            [5, 9, 3, 1, -1],
            [6, 9, 1, 1, 3],
          ],
          threshold: -0.0012344559654593468,
          right_val: -0.0553813390433788,
          left_val: 0.1714538037776947,
        },
        {
          features: [
            [4, 5, 4, 4, -1],
            [4, 5, 2, 2, 2],
            [6, 7, 2, 2, 2],
          ],
          threshold: -0.0027302911039441824,
          right_val: 0.0742667093873024,
          left_val: -0.1304433941841126,
        },
        {
          features: [
            [8, 5, 2, 3, -1],
            [8, 6, 2, 1, 3],
          ],
          threshold: 0.0005556254182010889,
          right_val: 0.1045415997505188,
          left_val: -0.1018731966614723,
        },
        {
          features: [
            [5, 6, 4, 7, -1],
            [7, 6, 2, 7, 2],
          ],
          threshold: 0.001514035975560546,
          right_val: -0.1189856007695198,
          left_val: 0.0828438401222229,
        },
        {
          features: [
            [10, 8, 3, 5, -1],
            [11, 8, 1, 5, 3],
          ],
          threshold: -0.00007255597301991656,
          right_val: 0.0711324065923691,
          left_val: -0.125122994184494,
        },
        {
          features: [
            [11, 4, 3, 13, -1],
            [12, 4, 1, 13, 3],
          ],
          threshold: -0.00024981278693303466,
          right_val: 0.0689631029963493,
          left_val: -0.131256103515625,
        },
        {
          features: [
            [2, 13, 3, 3, -1],
            [3, 13, 1, 3, 3],
          ],
          threshold: -0.006020642817020416,
          right_val: -0.0476031117141247,
          left_val: 0.212844505906105,
        },
        {
          features: [
            [4, 8, 3, 2, -1],
            [5, 8, 1, 2, 3],
          ],
          threshold: -0.0007246910245157778,
          right_val: -0.0855496302247047,
          left_val: 0.1049965992569923,
        },
        {
          features: [
            [0, 4, 1, 3, -1],
            [0, 5, 1, 1, 3],
          ],
          threshold: 0.000637403572909534,
          right_val: -0.1735329031944275,
          left_val: 0.0546554811298847,
        },
        {
          features: [
            [7, 6, 6, 6, -1],
            [9, 6, 2, 6, 3],
          ],
          threshold: 0.010901190340519,
          right_val: 0.1875264942646027,
          left_val: -0.0528322793543339,
        },
        {
          features: [
            [7, 7, 4, 12, -1],
            [9, 7, 2, 12, 2],
          ],
          threshold: 0.007073401007801294,
          right_val: -0.1646843999624252,
          left_val: 0.0629588067531586,
        },
        {
          features: [
            [6, 12, 6, 3, -1],
            [9, 12, 3, 3, 2],
          ],
          threshold: 0.00133337895385921,
          right_val: 0.0947168096899986,
          left_val: -0.1259087026119232,
        },
      ],
      threshold: -1.3934370279312134,
    },
    {
      simpleClassifiers: [
        {
          features: [
            [8, 6, 9, 12, -1],
            [8, 10, 9, 4, 3],
          ],
          threshold: 0.0620539896190166,
          right_val: 0.2359109967947006,
          left_val: -0.2542702853679657,
        },
        {
          features: [
            [11, 0, 3, 15, -1],
            [11, 5, 3, 5, 3],
          ],
          threshold: 0.005953462794423103,
          right_val: 0.1775193959474564,
          left_val: -0.2254436016082764,
        },
        {
          features: [
            [8, 16, 6, 4, -1],
            [8, 16, 3, 2, 2],
            [11, 18, 3, 2, 2],
          ],
          threshold: 0.007247737143188715,
          right_val: 0.2755671143531799,
          left_val: -0.1139805018901825,
        },
        {
          features: [
            [6, 5, 10, 6, -1],
            [6, 7, 10, 2, 3],
          ],
          threshold: -0.002282453002408147,
          right_val: -0.3141239881515503,
          left_val: 0.0862776786088943,
        },
        {
          features: [
            [2, 12, 3, 4, -1],
            [3, 12, 1, 4, 3],
          ],
          threshold: 0.0117760198190808,
          right_val: 0.3444347977638245,
          left_val: -0.0623603388667107,
        },
        {
          features: [
            [9, 13, 4, 3, -1],
            [9, 14, 4, 1, 3],
          ],
          threshold: 0.004385534208267927,
          right_val: -0.5012872815132141,
          left_val: 0.0181057695299387,
        },
        {
          features: [
            [3, 0, 4, 6, -1],
            [3, 0, 2, 3, 2],
            [5, 3, 2, 3, 2],
          ],
          threshold: 0.0158590693026781,
          right_val: 0.2640259861946106,
          left_val: -0.0787651464343071,
        },
        {
          features: [
            [5, 9, 6, 1, -1],
            [8, 9, 3, 1, 2],
          ],
          threshold: 0.003065411001443863,
          right_val: -0.4342781901359558,
          left_val: 0.0332502387464046,
        },
        {
          features: [
            [11, 14, 2, 3, -1],
            [11, 15, 2, 1, 3],
          ],
          threshold: 0.0025912460405379534,
          right_val: -0.4965820014476776,
          left_val: 0.0405785702168942,
        },
        {
          features: [
            [5, 8, 2, 1, -1],
            [6, 8, 1, 1, 2],
          ],
          threshold: 0.0003083476913161576,
          right_val: 0.1233901977539063,
          left_val: -0.1461576968431473,
        },
        {
          features: [
            [17, 0, 3, 12, -1],
            [17, 4, 3, 4, 3],
          ],
          threshold: -0.0024314899928867817,
          right_val: -0.1999931037425995,
          left_val: 0.0727393329143524,
        },
        {
          features: [
            [10, 13, 3, 6, -1],
            [11, 13, 1, 6, 3],
          ],
          threshold: -0.001893423032015562,
          right_val: 0.0564643703401089,
          left_val: -0.2337359935045242,
        },
        {
          features: [
            [10, 13, 3, 7, -1],
            [11, 13, 1, 7, 3],
          ],
          threshold: 0.004472428932785988,
          right_val: -0.3125874102115631,
          left_val: 0.0470428802073002,
        },
        {
          features: [
            [6, 5, 6, 1, -1],
            [8, 5, 2, 1, 3],
          ],
          threshold: 0.00015810050535947084,
          right_val: 0.1013709008693695,
          left_val: -0.1309830993413925,
        },
        {
          features: [
            [18, 2, 2, 8, -1],
            [19, 2, 1, 8, 2],
          ],
          threshold: 0.0187559891492128,
          right_val: 0.3714911043643951,
          left_val: -0.0381837897002697,
        },
        {
          features: [
            [5, 8, 3, 1, -1],
            [6, 8, 1, 1, 3],
          ],
          threshold: -0.0007487696711905301,
          right_val: -0.0602783896028996,
          left_val: 0.1998195946216583,
        },
        {
          features: [
            [8, 7, 4, 6, -1],
            [8, 7, 2, 3, 2],
            [10, 10, 2, 3, 2],
          ],
          threshold: -0.0009386101155541837,
          right_val: -0.1600127071142197,
          left_val: 0.0874677076935768,
        },
        {
          features: [
            [8, 3, 2, 2, -1],
            [8, 3, 1, 1, 2],
            [9, 4, 1, 1, 2],
          ],
          threshold: -0.0013442989438772202,
          right_val: 0.0365641117095947,
          left_val: -0.3307205140590668,
        },
        {
          features: [
            [18, 5, 2, 3, -1],
            [18, 6, 2, 1, 3],
          ],
          threshold: -0.001138419029302895,
          right_val: 0.0566144809126854,
          left_val: -0.2063006013631821,
        },
        {
          features: [
            [17, 7, 3, 4, -1],
            [18, 7, 1, 4, 3],
          ],
          threshold: 0.002596626989543438,
          right_val: 0.1919585019350052,
          left_val: -0.0626760199666023,
        },
        {
          features: [
            [8, 2, 2, 4, -1],
            [8, 2, 1, 2, 2],
            [9, 4, 1, 2, 2],
          ],
          threshold: 0.0012499650474637747,
          right_val: -0.1960525959730148,
          left_val: 0.0573902800679207,
        },
        {
          features: [
            [4, 6, 2, 2, -1],
            [5, 6, 1, 2, 2],
          ],
          threshold: 0.0011832700110971928,
          right_val: 0.1368297934532166,
          left_val: -0.085788756608963,
        },
        {
          features: [
            [4, 8, 3, 1, -1],
            [5, 8, 1, 1, 3],
          ],
          threshold: -0.005183613859117031,
          right_val: -0.0467364601790905,
          left_val: 0.3163569867610931,
        },
        {
          features: [
            [10, 9, 9, 10, -1],
            [10, 14, 9, 5, 2],
          ],
          threshold: -0.1318579018115997,
          right_val: 0.0187980905175209,
          left_val: -0.6227962970733643,
        },
        {
          features: [
            [6, 4, 3, 1, -1],
            [7, 4, 1, 1, 3],
          ],
          threshold: 0.0018653980223461986,
          right_val: -0.3010432124137878,
          left_val: 0.038837268948555,
        },
        {
          features: [
            [8, 14, 1, 3, -1],
            [8, 15, 1, 1, 3],
          ],
          threshold: 0.0007348248036578298,
          right_val: 0.1500207930803299,
          left_val: -0.0766120478510857,
        },
        {
          features: [
            [6, 4, 2, 1, -1],
            [7, 4, 1, 1, 2],
          ],
          threshold: -0.00015738410002086312,
          right_val: 0.0700204521417618,
          left_val: -0.1658836007118225,
        },
        {
          features: [
            [5, 9, 3, 9, -1],
            [5, 12, 3, 3, 3],
          ],
          threshold: 0.0005177921266295016,
          right_val: -0.1635819971561432,
          left_val: 0.074801079928875,
        },
        {
          features: [
            [5, 13, 7, 3, -1],
            [5, 14, 7, 1, 3],
          ],
          threshold: 0.007590427063405514,
          right_val: 0.2448772042989731,
          left_val: -0.051050990819931,
        },
        {
          features: [
            [9, 6, 2, 10, -1],
            [9, 6, 1, 5, 2],
            [10, 11, 1, 5, 2],
          ],
          threshold: -0.0110102500766516,
          right_val: 0.0206220094114542,
          left_val: -0.5838040113449097,
        },
        {
          features: [
            [13, 1, 3, 18, -1],
            [13, 10, 3, 9, 2],
          ],
          threshold: 0.1162184998393059,
          right_val: -0.412626713514328,
          left_val: 0.0251750592142344,
        },
        {
          features: [
            [5, 13, 2, 3, -1],
            [5, 14, 2, 1, 3],
          ],
          threshold: -0.0007446804083883762,
          right_val: -0.0896755009889603,
          left_val: 0.1272978931665421,
        },
        {
          features: [
            [9, 10, 3, 7, -1],
            [10, 10, 1, 7, 3],
          ],
          threshold: 0.0117653096094728,
          right_val: -0.5317276120185852,
          left_val: 0.0209066793322563,
        },
        {
          features: [
            [17, 0, 3, 13, -1],
            [18, 0, 1, 13, 3],
          ],
          threshold: -0.00444416981190443,
          right_val: -0.078762412071228,
          left_val: 0.1428263932466507,
        },
        {
          features: [
            [13, 6, 1, 2, -1],
            [13, 7, 1, 1, 2],
          ],
          threshold: -0.00043369788909330964,
          right_val: 0.0545549504458904,
          left_val: -0.2213145941495895,
        },
        {
          features: [
            [6, 15, 3, 2, -1],
            [7, 15, 1, 2, 3],
          ],
          threshold: -0.001920401002280414,
          right_val: 0.0406009182333946,
          left_val: -0.2561072111129761,
        },
        {
          features: [
            [5, 14, 2, 3, -1],
            [5, 15, 2, 1, 3],
          ],
          threshold: -0.0029081690590828657,
          right_val: -0.0562228299677372,
          left_val: 0.2020632028579712,
        },
        {
          features: [
            [16, 6, 1, 6, -1],
            [16, 8, 1, 2, 3],
          ],
          threshold: -0.00001454994981031632,
          right_val: -0.1177052035927773,
          left_val: 0.0900005027651787,
        },
        {
          features: [
            [0, 6, 2, 2, -1],
            [1, 6, 1, 2, 2],
          ],
          threshold: -0.0005321766948327422,
          right_val: 0.0689254924654961,
          left_val: -0.152994304895401,
        },
        {
          features: [
            [3, 12, 4, 8, -1],
            [3, 12, 2, 4, 2],
            [5, 16, 2, 4, 2],
          ],
          threshold: -0.0145901795476675,
          right_val: -0.0518504306674004,
          left_val: 0.2177651971578598,
        },
        {
          features: [
            [6, 2, 2, 8, -1],
            [7, 2, 1, 8, 2],
          ],
          threshold: -0.00040213059401139617,
          right_val: -0.1102764010429382,
          left_val: 0.094017893075943,
        },
        {
          features: [
            [6, 7, 2, 6, -1],
            [6, 7, 1, 3, 2],
            [7, 10, 1, 3, 2],
          ],
          threshold: -0.002308988943696022,
          right_val: -0.0578570403158665,
          left_val: 0.2479234933853149,
        },
        {
          features: [
            [5, 12, 4, 2, -1],
            [7, 12, 2, 2, 2],
          ],
          threshold: 0.0003119613975286484,
          right_val: 0.0772474929690361,
          left_val: -0.1402194052934647,
        },
        {
          features: [
            [4, 9, 13, 2, -1],
            [4, 10, 13, 1, 2],
          ],
          threshold: -0.009131700731813908,
          right_val: -0.0289535094052553,
          left_val: 0.4024280905723572,
        },
        {
          features: [
            [19, 5, 1, 2, -1],
            [19, 6, 1, 1, 2],
          ],
          threshold: 0.00042655199649743736,
          right_val: -0.21355339884758,
          left_val: 0.0531143881380558,
        },
        {
          features: [
            [4, 8, 9, 1, -1],
            [7, 8, 3, 1, 3],
          ],
          threshold: 0.003995622042566538,
          right_val: -0.2299441993236542,
          left_val: 0.044066920876503,
        },
        {
          features: [
            [8, 8, 2, 1, -1],
            [9, 8, 1, 1, 2],
          ],
          threshold: -0.001401204033754766,
          right_val: -0.0451718308031559,
          left_val: 0.2710689902305603,
        },
        {
          features: [
            [3, 0, 2, 10, -1],
            [3, 5, 2, 5, 2],
          ],
          threshold: 0.0360647700726986,
          right_val: -0.3283013105392456,
          left_val: 0.0336280800402164,
        },
        {
          features: [
            [6, 2, 2, 1, -1],
            [7, 2, 1, 1, 2],
          ],
          threshold: -0.00013408949598670006,
          right_val: 0.080078050494194,
          left_val: -0.1388804018497467,
        },
        {
          features: [
            [14, 5, 3, 3, -1],
            [15, 5, 1, 3, 3],
          ],
          threshold: -0.006948031950742006,
          right_val: 0.0273029301315546,
          left_val: -0.393154501914978,
        },
        {
          features: [
            [4, 8, 2, 2, -1],
            [4, 8, 1, 1, 2],
            [5, 9, 1, 1, 2],
          ],
          threshold: -0.0014855440240353346,
          right_val: -0.0515620708465576,
          left_val: 0.1976166963577271,
        },
        {
          features: [
            [8, 16, 9, 2, -1],
            [8, 17, 9, 1, 2],
          ],
          threshold: -0.0137575399130583,
          right_val: 0.0183015707880259,
          left_val: -0.5562098026275635,
        },
        {
          features: [
            [6, 7, 2, 3, -1],
            [6, 8, 2, 1, 3],
          ],
          threshold: 0.008402114734053612,
          right_val: -0.6317132115364075,
          left_val: 0.0136904800310731,
        },
        {
          features: [
            [12, 11, 2, 2, -1],
            [12, 11, 1, 1, 2],
            [13, 12, 1, 1, 2],
          ],
          threshold: -0.00017845979891717434,
          right_val: 0.0639211311936378,
          left_val: -0.1453599035739899,
        },
        {
          features: [
            [15, 9, 2, 4, -1],
            [15, 11, 2, 2, 2],
          ],
          threshold: -0.0113268503919244,
          right_val: -0.0164606291800737,
          left_val: 0.6587061285972595,
        },
        {
          features: [
            [5, 11, 2, 3, -1],
            [5, 12, 2, 1, 3],
          ],
          threshold: 0.0015268150018528104,
          right_val: 0.1545401066541672,
          left_val: -0.0603895410895348,
        },
        {
          features: [
            [6, 11, 2, 3, -1],
            [6, 12, 2, 1, 3],
          ],
          threshold: -0.0060069989413022995,
          right_val: -0.0494669713079929,
          left_val: 0.2585973143577576,
        },
        {
          features: [
            [6, 12, 1, 6, -1],
            [6, 15, 1, 3, 2],
          ],
          threshold: -0.00742412218824029,
          right_val: 0.0293931905180216,
          left_val: -0.3880611062049866,
        },
        {
          features: [
            [6, 9, 5, 9, -1],
            [6, 12, 5, 3, 3],
          ],
          threshold: -0.003999243024736643,
          right_val: 0.0779918804764748,
          left_val: -0.1378819942474365,
        },
        {
          features: [
            [8, 11, 2, 2, -1],
            [8, 12, 2, 1, 2],
          ],
          threshold: 0.00010202969860984012,
          right_val: -0.1703258007764816,
          left_val: 0.0727107375860214,
        },
        {
          features: [
            [8, 10, 4, 2, -1],
            [10, 10, 2, 2, 2],
          ],
          threshold: 0.0004013559955637902,
          right_val: 0.1230544000864029,
          left_val: -0.0927880182862282,
        },
        {
          features: [
            [8, 10, 4, 6, -1],
            [8, 10, 2, 3, 2],
            [10, 13, 2, 3, 2],
          ],
          threshold: -0.009761180728673935,
          right_val: 0.0297488998621702,
          left_val: -0.3663052022457123,
        },
        {
          features: [
            [2, 0, 9, 20, -1],
            [5, 0, 3, 20, 3],
          ],
          threshold: -0.3074553906917572,
          right_val: 0.013058690354228,
          left_val: -0.7865182161331177,
        },
        {
          features: [
            [12, 3, 2, 4, -1],
            [12, 3, 1, 2, 2],
            [13, 5, 1, 2, 2],
          ],
          threshold: -0.006023171823471785,
          right_val: 0.0181716196238995,
          left_val: -0.5090023875236511,
        },
        {
          features: [
            [15, 0, 2, 10, -1],
            [16, 0, 1, 10, 2],
          ],
          threshold: -0.00023784159566275775,
          right_val: 0.1053086966276169,
          left_val: -0.0998225212097168,
        },
        {
          features: [
            [13, 7, 3, 4, -1],
            [14, 7, 1, 4, 3],
          ],
          threshold: 0.001351622981019318,
          right_val: 0.1542510986328125,
          left_val: -0.0664440169930458,
        },
        {
          features: [
            [14, 10, 1, 2, -1],
            [14, 11, 1, 1, 2],
          ],
          threshold: -0.0016924949595704675,
          right_val: 0.0251007005572319,
          left_val: -0.4413385093212128,
        },
        {
          features: [
            [16, 11, 3, 1, -1],
            [17, 11, 1, 1, 3],
          ],
          threshold: 0.0010610929457470775,
          right_val: 0.172179102897644,
          left_val: -0.0605778992176056,
        },
        {
          features: [
            [16, 11, 2, 2, -1],
            [16, 11, 1, 1, 2],
            [17, 12, 1, 1, 2],
          ],
          threshold: 0.0005664458149112761,
          right_val: 0.1678466945886612,
          left_val: -0.0786877796053886,
        },
        {
          features: [
            [13, 12, 6, 1, -1],
            [15, 12, 2, 1, 3],
          ],
          threshold: -0.0139553900808096,
          right_val: 0.0190871395170689,
          left_val: -0.5784109830856323,
        },
        {
          features: [
            [3, 2, 14, 9, -1],
            [10, 2, 7, 9, 2],
          ],
          threshold: -0.0018862909637391567,
          right_val: -0.1652339994907379,
          left_val: 0.0621181502938271,
        },
        {
          features: [
            [5, 4, 12, 2, -1],
            [11, 4, 6, 2, 2],
          ],
          threshold: 0.0167841706424952,
          right_val: 0.3610531985759735,
          left_val: -0.0303809195756912,
        },
        {
          features: [
            [13, 6, 2, 1, -1],
            [14, 6, 1, 1, 2],
          ],
          threshold: -0.000014158519661577884,
          right_val: -0.1440749019384384,
          left_val: 0.0721826329827309,
        },
        {
          features: [
            [7, 10, 3, 3, -1],
            [7, 11, 3, 1, 3],
          ],
          threshold: 0.007375045213848352,
          right_val: -0.2927787005901337,
          left_val: 0.0297915805131197,
        },
        {
          features: [
            [16, 17, 4, 2, -1],
            [18, 17, 2, 2, 2],
          ],
          threshold: 0.008051753044128418,
          right_val: 0.2176039963960648,
          left_val: -0.0446812994778156,
        },
        {
          features: [
            [4, 12, 8, 8, -1],
            [4, 12, 4, 4, 2],
            [8, 16, 4, 4, 2],
          ],
          threshold: -0.07951969653368,
          right_val: 0.0146189099177718,
          left_val: -0.6520869135856628,
        },
        {
          features: [
            [14, 8, 4, 5, -1],
            [16, 8, 2, 5, 2],
          ],
          threshold: 0.0120657002553344,
          right_val: -0.294541209936142,
          left_val: 0.0292028803378344,
        },
        {
          features: [
            [11, 8, 6, 2, -1],
            [13, 8, 2, 2, 3],
          ],
          threshold: -0.010122699663043,
          right_val: -0.0437135696411133,
          left_val: 0.2774623930454254,
        },
        {
          features: [
            [4, 5, 16, 5, -1],
            [12, 5, 8, 5, 2],
          ],
          threshold: -0.1851581037044525,
          right_val: 0.0240932404994965,
          left_val: -0.461368590593338,
        },
        {
          features: [
            [14, 9, 6, 10, -1],
            [16, 9, 2, 10, 3],
          ],
          threshold: -0.0807261317968369,
          right_val: 0.0208454597741365,
          left_val: -0.4467343091964722,
        },
        {
          features: [
            [4, 18, 3, 1, -1],
            [5, 18, 1, 1, 3],
          ],
          threshold: 0.0015173270367085934,
          right_val: 0.1806337982416153,
          left_val: -0.0515759699046612,
        },
        {
          features: [
            [4, 13, 4, 4, -1],
            [4, 13, 2, 2, 2],
            [6, 15, 2, 2, 2],
          ],
          threshold: -0.0111848199740052,
          right_val: 0.0270595401525497,
          left_val: -0.3537395894527435,
        },
        {
          features: [
            [6, 15, 2, 3, -1],
            [6, 16, 2, 1, 3],
          ],
          threshold: -0.003500839928165078,
          right_val: -0.0460320599377155,
          left_val: 0.2054871022701263,
        },
        {
          features: [
            [6, 15, 1, 3, -1],
            [6, 16, 1, 1, 3],
          ],
          threshold: 0.0014720410108566284,
          right_val: 0.1816830039024353,
          left_val: -0.0638717114925385,
        },
        {
          features: [
            [7, 17, 3, 1, -1],
            [8, 17, 1, 1, 3],
          ],
          threshold: -0.0004502183001022786,
          right_val: 0.0593277402222157,
          left_val: -0.1635392010211945,
        },
        {
          features: [
            [7, 17, 3, 1, -1],
            [8, 17, 1, 1, 3],
          ],
          threshold: 0.0006165347876958549,
          right_val: -0.1915604025125504,
          left_val: 0.0690893232822418,
        },
        {
          features: [
            [9, 10, 4, 1, -1],
            [11, 10, 2, 1, 2],
          ],
          threshold: 0.0014797239564359188,
          right_val: 0.1863134056329727,
          left_val: -0.052241999655962,
        },
        {
          features: [
            [11, 12, 2, 1, -1],
            [12, 12, 1, 1, 2],
          ],
          threshold: -0.000014754989933862817,
          right_val: -0.1509232074022293,
          left_val: 0.073586143553257,
        },
        {
          features: [
            [7, 8, 1, 6, -1],
            [7, 11, 1, 3, 2],
          ],
          threshold: 0.0008642363245598972,
          right_val: -0.1397610008716583,
          left_val: 0.0669300779700279,
        },
        {
          features: [
            [6, 7, 3, 3, -1],
            [7, 7, 1, 3, 3],
          ],
          threshold: -0.0041005611419677734,
          right_val: -0.047175008803606,
          left_val: 0.2094669938087463,
        },
        {
          features: [
            [13, 10, 1, 3, -1],
            [13, 11, 1, 1, 3],
          ],
          threshold: -0.002150533953681588,
          right_val: 0.0176652502268553,
          left_val: -0.5275384187698364,
        },
        {
          features: [
            [5, 8, 2, 4, -1],
            [5, 10, 2, 2, 2],
          ],
          threshold: 0.007833472453057766,
          right_val: 0.2037491947412491,
          left_val: -0.0451250113546848,
        },
        {
          features: [
            [5, 8, 6, 6, -1],
            [8, 8, 3, 6, 2],
          ],
          threshold: -0.0032690390944480896,
          right_val: 0.0706531628966331,
          left_val: -0.1383669972419739,
        },
        {
          features: [
            [6, 5, 4, 13, -1],
            [8, 5, 2, 13, 2],
          ],
          threshold: 0.003927474841475487,
          right_val: -0.1621017009019852,
          left_val: 0.068428598344326,
        },
        {
          features: [
            [8, 4, 10, 8, -1],
            [8, 4, 5, 4, 2],
            [13, 8, 5, 4, 2],
          ],
          threshold: 0.007653454784303904,
          right_val: 0.0999126806855202,
          left_val: -0.0931621566414833,
        },
        {
          features: [
            [8, 3, 9, 6, -1],
            [11, 3, 3, 6, 3],
          ],
          threshold: -0.0326201505959034,
          right_val: -0.0307653397321701,
          left_val: 0.3545354902744293,
        },
        {
          features: [
            [11, 0, 6, 3, -1],
            [13, 0, 2, 3, 3],
          ],
          threshold: -0.0182472094893456,
          right_val: 0.027764180675149,
          left_val: -0.3817118108272553,
        },
        {
          features: [
            [11, 1, 3, 15, -1],
            [12, 1, 1, 15, 3],
          ],
          threshold: -0.0008010407909750938,
          right_val: 0.0649366304278374,
          left_val: -0.1432909965515137,
        },
        {
          features: [
            [4, 8, 14, 9, -1],
            [4, 11, 14, 3, 3],
          ],
          threshold: -0.1099310964345932,
          right_val: -0.01124267000705,
          left_val: 0.8731942772865295,
        },
        {
          features: [
            [11, 2, 1, 16, -1],
            [11, 10, 1, 8, 2],
          ],
          threshold: -0.0305081997066736,
          right_val: 0.0193726997822523,
          left_val: -0.612698495388031,
        },
        {
          features: [
            [12, 1, 2, 14, -1],
            [12, 8, 2, 7, 2],
          ],
          threshold: -0.0191878192126751,
          right_val: -0.0368323288857937,
          left_val: 0.285330206155777,
        },
        {
          features: [
            [11, 1, 3, 4, -1],
            [12, 1, 1, 4, 3],
          ],
          threshold: 0.0023266570642590523,
          right_val: -0.2125295996665955,
          left_val: 0.0472893603146076,
        },
        {
          features: [
            [9, 8, 4, 2, -1],
            [9, 8, 2, 1, 2],
            [11, 9, 2, 1, 2],
          ],
          threshold: -0.0014535760274156928,
          right_val: -0.0745014920830727,
          left_val: 0.1377892047166824,
        },
        {
          features: [
            [17, 3, 2, 2, -1],
            [18, 3, 1, 2, 2],
          ],
          threshold: -0.001057364046573639,
          right_val: 0.0420391708612442,
          left_val: -0.2218683063983917,
        },
        {
          features: [
            [2, 6, 3, 2, -1],
            [3, 6, 1, 2, 3],
          ],
          threshold: 0.0017203199677169323,
          right_val: 0.1379489004611969,
          left_val: -0.0692997500300407,
        },
        {
          features: [
            [9, 8, 2, 2, -1],
            [9, 9, 2, 1, 2],
          ],
          threshold: -0.0014716150471940637,
          right_val: -0.0407950095832348,
          left_val: 0.2429670989513397,
        },
        {
          features: [
            [6, 15, 6, 1, -1],
            [8, 15, 2, 1, 3],
          ],
          threshold: -0.005282266065478325,
          right_val: 0.03421526029706,
          left_val: -0.3195948004722595,
        },
        {
          features: [
            [16, 10, 2, 4, -1],
            [16, 10, 1, 2, 2],
            [17, 12, 1, 2, 2],
          ],
          threshold: -0.004716574214398861,
          right_val: -0.0317729189991951,
          left_val: 0.3058119118213654,
        },
        {
          features: [
            [6, 6, 10, 6, -1],
            [6, 6, 5, 3, 2],
            [11, 9, 5, 3, 2],
          ],
          threshold: 0.007366837002336979,
          right_val: -0.1639001965522766,
          left_val: 0.0610850788652897,
        },
        {
          features: [
            [13, 8, 3, 3, -1],
            [13, 9, 3, 1, 3],
          ],
          threshold: -0.007659499999135733,
          right_val: 0.0188697502017021,
          left_val: -0.4647234976291657,
        },
        {
          features: [
            [13, 0, 4, 2, -1],
            [13, 0, 2, 1, 2],
            [15, 1, 2, 1, 2],
          ],
          threshold: 0.007696902845054865,
          right_val: 0.5539581179618835,
          left_val: -0.0181915909051895,
        },
        {
          features: [
            [10, 0, 10, 2, -1],
            [10, 0, 5, 1, 2],
            [15, 1, 5, 1, 2],
          ],
          threshold: -0.0005619585863314569,
          right_val: -0.1084408983588219,
          left_val: 0.0976184830069542,
        },
        {
          features: [
            [13, 13, 2, 1, -1],
            [14, 13, 1, 1, 2],
          ],
          threshold: -0.000014587530131393578,
          right_val: -0.1235361024737358,
          left_val: 0.0745851323008537,
        },
        {
          features: [
            [4, 9, 2, 2, -1],
            [4, 9, 1, 1, 2],
            [5, 10, 1, 1, 2],
          ],
          threshold: -0.0009577937889844179,
          right_val: -0.0586100816726685,
          left_val: 0.1637014001607895,
        },
        {
          features: [
            [6, 8, 2, 3, -1],
            [6, 9, 2, 1, 3],
          ],
          threshold: 0.00802535004913807,
          right_val: -0.4150776863098145,
          left_val: 0.0268576703965664,
        },
        {
          features: [
            [2, 12, 2, 3, -1],
            [2, 13, 2, 1, 3],
          ],
          threshold: 0.0016938529442995787,
          right_val: -0.1788846999406815,
          left_val: 0.0485362708568573,
        },
        {
          features: [
            [2, 0, 10, 2, -1],
            [2, 0, 5, 1, 2],
            [7, 1, 5, 1, 2],
          ],
          threshold: -0.004333417862653732,
          right_val: -0.0480850599706173,
          left_val: 0.1979822069406509,
        },
        {
          features: [
            [6, 2, 2, 2, -1],
            [6, 3, 2, 1, 2],
          ],
          threshold: -0.0002244002971565351,
          right_val: 0.060428649187088,
          left_val: -0.1511324942111969,
        },
        {
          features: [
            [5, 10, 8, 2, -1],
            [5, 11, 8, 1, 2],
          ],
          threshold: -0.0113925095647573,
          right_val: -0.0297512598335743,
          left_val: 0.3273792862892151,
        },
        {
          features: [
            [11, 7, 5, 10, -1],
            [11, 12, 5, 5, 2],
          ],
          threshold: -0.009398417547345161,
          right_val: 0.076302282512188,
          left_val: -0.1291299015283585,
        },
        {
          features: [
            [5, 10, 4, 3, -1],
            [5, 11, 4, 1, 3],
          ],
          threshold: 0.0008743017097003758,
          right_val: 0.0978080108761787,
          left_val: -0.0975561663508415,
        },
        {
          features: [
            [9, 6, 6, 12, -1],
            [9, 12, 6, 6, 2],
          ],
          threshold: 0.007517161779105663,
          right_val: -0.154194101691246,
          left_val: 0.0650843530893326,
        },
        {
          features: [
            [16, 10, 3, 5, -1],
            [17, 10, 1, 5, 3],
          ],
          threshold: -0.002793706953525543,
          right_val: -0.0633553937077522,
          left_val: 0.1500952988862991,
        },
        {
          features: [
            [15, 12, 2, 4, -1],
            [15, 12, 1, 2, 2],
            [16, 14, 1, 2, 2],
          ],
          threshold: -0.0003438509884290397,
          right_val: -0.0757806301116943,
          left_val: 0.1240428984165192,
        },
        {
          features: [
            [8, 0, 12, 8, -1],
            [8, 0, 6, 4, 2],
            [14, 4, 6, 4, 2],
          ],
          threshold: 0.087557926774025,
          right_val: 0.566073477268219,
          left_val: -0.0159059409052134,
        },
        {
          features: [
            [14, 1, 5, 3, -1],
            [14, 2, 5, 1, 3],
          ],
          threshold: -0.009359443560242653,
          right_val: 0.0308747105300426,
          left_val: -0.3303920030593872,
        },
        {
          features: [
            [2, 2, 3, 6, -1],
            [3, 2, 1, 6, 3],
          ],
          threshold: -0.006770373787730932,
          right_val: -0.0513103194534779,
          left_val: 0.1796087026596069,
        },
        {
          features: [
            [6, 5, 2, 2, -1],
            [7, 5, 1, 2, 2],
          ],
          threshold: -0.006251375190913677,
          right_val: 0.0154257696121931,
          left_val: -0.5795233845710754,
        },
        {
          features: [
            [7, 12, 12, 1, -1],
            [11, 12, 4, 1, 3],
          ],
          threshold: -0.0252064093947411,
          right_val: 0.013051119633019,
          left_val: -0.6377707123756409,
        },
        {
          features: [
            [13, 9, 7, 2, -1],
            [13, 10, 7, 1, 2],
          ],
          threshold: -0.001181976986117661,
          right_val: 0.0404945313930511,
          left_val: -0.204781100153923,
        },
        {
          features: [
            [5, 10, 1, 3, -1],
            [5, 11, 1, 1, 3],
          ],
          threshold: -0.0010458839824423194,
          right_val: -0.0626315921545029,
          left_val: 0.1481287926435471,
        },
        {
          features: [
            [0, 4, 15, 2, -1],
            [5, 4, 5, 2, 3],
          ],
          threshold: -0.002544502029195428,
          right_val: -0.069430023431778,
          left_val: 0.1302101016044617,
        },
        {
          features: [
            [3, 0, 9, 13, -1],
            [6, 0, 3, 13, 3],
          ],
          threshold: -0.0806736275553703,
          right_val: 0.03895628079772,
          left_val: -0.2805421948432922,
        },
        {
          features: [
            [5, 10, 6, 2, -1],
            [7, 10, 2, 2, 3],
          ],
          threshold: -0.00014390920114237815,
          right_val: -0.0965507626533508,
          left_val: 0.1078051999211311,
        },
        {
          features: [
            [8, 3, 4, 2, -1],
            [8, 3, 2, 1, 2],
            [10, 4, 2, 1, 2],
          ],
          threshold: 0.0007648143218830228,
          right_val: -0.1574261039495468,
          left_val: 0.0606672391295433,
        },
        {
          features: [
            [8, 7, 2, 6, -1],
            [8, 7, 1, 3, 2],
            [9, 10, 1, 3, 2],
          ],
          threshold: -0.0003451668890193105,
          right_val: -0.0888323709368706,
          left_val: 0.1141576990485191,
        },
        {
          features: [
            [8, 7, 2, 3, -1],
            [9, 7, 1, 3, 2],
          ],
          threshold: -0.0022118249908089638,
          right_val: -0.0504987388849258,
          left_val: 0.2298803925514221,
        },
        {
          features: [
            [5, 11, 3, 3, -1],
            [6, 11, 1, 3, 3],
          ],
          threshold: 0.009461654350161552,
          right_val: -0.5063353180885315,
          left_val: 0.0198270604014397,
        },
        {
          features: [
            [0, 1, 1, 2, -1],
            [0, 2, 1, 1, 2],
          ],
          threshold: 0.0010567939607426524,
          right_val: -0.2350935935974121,
          left_val: 0.0387446396052837,
        },
        {
          features: [
            [7, 0, 1, 6, -1],
            [7, 2, 1, 2, 3],
          ],
          threshold: 0.002919446909800172,
          right_val: 0.1531331986188889,
          left_val: -0.0618954785168171,
        },
        {
          features: [
            [14, 0, 2, 5, -1],
            [15, 0, 1, 5, 2],
          ],
          threshold: -0.0107680102810264,
          right_val: 0.0178472399711609,
          left_val: -0.5529810190200806,
        },
        {
          features: [
            [3, 2, 12, 1, -1],
            [7, 2, 4, 1, 3],
          ],
          threshold: -0.001019774004817009,
          right_val: -0.0801858529448509,
          left_val: 0.1155930012464523,
        },
        {
          features: [
            [11, 13, 5, 2, -1],
            [11, 14, 5, 1, 2],
          ],
          threshold: 0.0001812702976167202,
          right_val: -0.1654936969280243,
          left_val: 0.056652870029211,
        },
        {
          features: [
            [13, 14, 1, 3, -1],
            [13, 15, 1, 1, 3],
          ],
          threshold: 0.000007162018846429419,
          right_val: 0.0979150906205177,
          left_val: -0.09148009121418,
        },
        {
          features: [
            [7, 17, 12, 2, -1],
            [11, 17, 4, 2, 3],
          ],
          threshold: 0.0529100708663464,
          right_val: 0.660902202129364,
          left_val: -0.0135912001132965,
        },
        {
          features: [
            [0, 0, 13, 20, -1],
            [0, 10, 13, 10, 2],
          ],
          threshold: 0.4018537104129791,
          right_val: -0.4901585876941681,
          left_val: 0.0195744894444942,
        },
        {
          features: [
            [4, 7, 10, 12, -1],
            [4, 13, 10, 6, 2],
          ],
          threshold: -0.0179147701710463,
          right_val: 0.1053296029567719,
          left_val: -0.0883170366287231,
        },
        {
          features: [
            [10, 12, 2, 2, -1],
            [11, 12, 1, 2, 2],
          ],
          threshold: -0.000014578569789591711,
          right_val: -0.1230034977197647,
          left_val: 0.0785131528973579,
        },
        {
          features: [
            [9, 11, 4, 4, -1],
            [11, 11, 2, 4, 2],
          ],
          threshold: 0.006499454844743013,
          right_val: 0.2933715879917145,
          left_val: -0.0408434681594372,
        },
        {
          features: [
            [4, 9, 16, 5, -1],
            [12, 9, 8, 5, 2],
          ],
          threshold: 0.0957629829645157,
          right_val: -0.5344405770301819,
          left_val: 0.019332479685545,
        },
        {
          features: [
            [16, 9, 2, 4, -1],
            [17, 9, 1, 4, 2],
          ],
          threshold: 0.00001426346989319427,
          right_val: 0.1063278988003731,
          left_val: -0.0888975337147713,
        },
        {
          features: [
            [15, 9, 3, 1, -1],
            [16, 9, 1, 1, 3],
          ],
          threshold: 0.002221503993496299,
          right_val: 0.2640512883663178,
          left_val: -0.0407779514789581,
        },
        {
          features: [
            [14, 3, 4, 11, -1],
            [16, 3, 2, 11, 2],
          ],
          threshold: 0.00318752508610487,
          right_val: -0.1620295941829681,
          left_val: 0.0597250387072563,
        },
        {
          features: [
            [4, 3, 10, 10, -1],
            [4, 3, 5, 5, 2],
            [9, 8, 5, 5, 2],
          ],
          threshold: 0.0960695892572403,
          right_val: -0.7911068797111511,
          left_val: 0.0113184601068497,
        },
        {
          features: [
            [16, 9, 3, 1, -1],
            [17, 9, 1, 1, 3],
          ],
          threshold: 0.0019584870897233486,
          right_val: 0.2363992929458618,
          left_val: -0.039252020418644,
        },
        {
          features: [
            [6, 4, 14, 9, -1],
            [6, 7, 14, 3, 3],
          ],
          threshold: -0.184684693813324,
          right_val: 0.0157584100961685,
          left_val: -0.589743971824646,
        },
        {
          features: [
            [8, 11, 2, 4, -1],
            [8, 13, 2, 2, 2],
          ],
          threshold: 0.00021685050160158426,
          right_val: -0.1827467978000641,
          left_val: 0.0463204495608807,
        },
        {
          features: [
            [5, 9, 6, 8, -1],
            [5, 9, 3, 4, 2],
            [8, 13, 3, 4, 2],
          ],
          threshold: 0.0188097096979618,
          right_val: 0.2783260047435761,
          left_val: -0.0433571189641953,
        },
        {
          features: [
            [5, 11, 4, 4, -1],
            [5, 13, 4, 2, 2],
          ],
          threshold: -0.00626396993175149,
          right_val: 0.0771159008145332,
          left_val: -0.1389119029045105,
        },
        {
          features: [
            [7, 14, 1, 3, -1],
            [7, 15, 1, 1, 3],
          ],
          threshold: 0.0003262294048909098,
          right_val: 0.1058828979730606,
          left_val: -0.0918030217289925,
        },
        {
          features: [
            [9, 10, 3, 1, -1],
            [10, 10, 1, 1, 3],
          ],
          threshold: 0.005374555941671133,
          right_val: -0.7671645879745483,
          left_val: 0.0108034899458289,
        },
        {
          features: [
            [4, 8, 2, 4, -1],
            [4, 8, 1, 2, 2],
            [5, 10, 1, 2, 2],
          ],
          threshold: 0.002812677063047886,
          right_val: 0.1613305062055588,
          left_val: -0.0596188604831696,
        },
        {
          features: [
            [14, 6, 2, 5, -1],
            [15, 6, 1, 5, 2],
          ],
          threshold: -0.0006531461840495467,
          right_val: 0.1154076978564262,
          left_val: -0.0856908112764359,
        },
        {
          features: [
            [13, 7, 6, 7, -1],
            [15, 7, 2, 7, 3],
          ],
          threshold: -0.0017845110269263387,
          right_val: -0.1270080059766769,
          left_val: 0.0818319916725159,
        },
        {
          features: [
            [15, 6, 4, 7, -1],
            [17, 6, 2, 7, 2],
          ],
          threshold: 0.0030969830695539713,
          right_val: -0.1447543948888779,
          left_val: 0.068366639316082,
        },
        {
          features: [
            [9, 11, 6, 5, -1],
            [11, 11, 2, 5, 3],
          ],
          threshold: -0.004144204780459404,
          right_val: -0.0540303103625774,
          left_val: 0.1863203048706055,
        },
        {
          features: [
            [0, 8, 20, 4, -1],
            [10, 8, 10, 4, 2],
          ],
          threshold: -0.0499725192785263,
          right_val: 0.0850491598248482,
          left_val: -0.1280035972595215,
        },
        {
          features: [
            [1, 2, 8, 14, -1],
            [1, 2, 4, 7, 2],
            [5, 9, 4, 7, 2],
          ],
          threshold: -0.010743910446763,
          right_val: -0.0773664563894272,
          left_val: 0.1370172947645187,
        },
        {
          features: [
            [10, 13, 3, 1, -1],
            [11, 13, 1, 1, 3],
          ],
          threshold: -0.0003047414938919246,
          right_val: 0.0579711683094502,
          left_val: -0.1693834066390991,
        },
        {
          features: [
            [7, 0, 6, 4, -1],
            [9, 0, 2, 4, 3],
          ],
          threshold: 0.0360233187675476,
          right_val: -0.6327974796295166,
          left_val: 0.0135613000020385,
        },
        {
          features: [
            [7, 14, 6, 2, -1],
            [7, 14, 3, 1, 2],
            [10, 15, 3, 1, 2],
          ],
          threshold: 0.002547919051721692,
          right_val: 0.2215041965246201,
          left_val: -0.0438243597745895,
        },
      ],
      threshold: -1.273967981338501,
    },
  ],
  size: [20, 20],
  tilted: false,
};
