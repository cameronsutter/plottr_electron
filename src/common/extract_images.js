/** Places to look for image data:
 *
 * Card:
 *  - any attr at root level
 *  - (card).templates[x].attributes[y].value
 *  - desrciption
 *
 * Characters:
 *  - any attr at root level
 *  - (character).templates[x].(attributeName).value
 *  - notes
 *
 * Notes:
 *  - any attr at root level
 *  - content
 *
 * Places:
 *  - any attr at root level
 *  - notes
 *
 * Despite tracking down all of the places where the image-data can
 * live, I still want to create a general solution to the problem.
 */
export const extractImages = (file) => {

}
